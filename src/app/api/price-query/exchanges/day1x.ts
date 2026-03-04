import { parseD1OrderBook } from '@/lib/utils'
import { D1OrderBookResponse } from '@/types/types'
import { ExchangeHandler, MarketNotFoundError, OrderBook } from '../types'

const DAY1X_REST_ORDERBOOK_URL = 'https://exchange-api.day1x.io/api/coinmarketcap/orderbook'
const DAY1X_WS_URL = 'wss://exchange-api.day1x.io/ws/talos'
const DAY1X_SOCKET_TIMEOUT_MS = 8000
const DAY1X_SOCKET_DEBUG = ['1', 'true', 'yes', 'on'].includes(
    (process.env.DAY1X_SOCKET_DEBUG ?? '').trim().toLowerCase()
)

const DAY1X_SOCKET_COUNTERPARTY = 'General_Tier' //
const DAY1X_SOCKET_THROTTLE = '1s'
const DAY1X_SOCKET_DEPTH = 16

export const getDay1xOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const market = `${base}/${quote}`
    try {
        return await getDay1xOrderBookSocket(base, quote)
    } catch (socketError) {
        logDay1xRest('socket failed, falling back to REST', {
            market,
            error: toErrorMessage(socketError),
        })

        try {
            const orderbook = await getDay1xOrderBookRest(base, quote)
            logDay1xRest('REST fallback succeeded', {
                market,
                asks: orderbook.asks.length,
                bids: orderbook.bids.length,
            })
            return orderbook
        } catch (restError) {
            logDay1xRest('REST fallback failed', {
                market,
                error: toErrorMessage(restError),
            })
            throw restError
        }
    }
}

export const getDay1xOrderBookSocket: ExchangeHandler = async (base: string, quote: string) => {
    return requestDay1xSocketOrderbook(`${base}/${quote}`)
}

const getDay1xOrderBookRest: ExchangeHandler = async (base: string, quote: string) => {
    const market = `${base}/${quote}`
    const url = `${DAY1X_REST_ORDERBOOK_URL}/${base}-${quote}`
    logDay1xRest('requesting REST orderbook', { market, url })

    const res = await fetch(url)
    logDay1xRest('received REST response', { market, status: res.status, ok: res.ok })

    if (!res.ok) {
        if (res.status === 404) {
            throw new MarketNotFoundError(`${base}/${quote}`, 'day1x')
        }
        throw new Error(res.statusText)
    }

    const json: D1OrderBookResponse = await res.json()
    const orderbook = parseD1OrderBook(json)
    logDay1xRest('parsed REST orderbook', {
        market,
        asks: orderbook.asks.length,
        bids: orderbook.bids.length,
    })
    return orderbook
}

type Day1xMessage = {
    data?: unknown
    error?: {
        msg?: unknown
    }
    ts?: unknown
    type?: unknown
}

async function requestDay1xSocketOrderbook(market: string): Promise<OrderBook> {
    const day1xSymbol = toDay1xSymbol(market)
    logDay1xSocket('starting orderbook request', { market, symbol: day1xSymbol })

    return new Promise((resolve, reject) => {
        const socket = new WebSocket(DAY1X_WS_URL)
        let settled = false
        let lastNonOnlineStatus: string | undefined
        logDay1xSocket('socket created', { market, url: DAY1X_WS_URL })

        const timeout = setTimeout(() => {
            const timeoutMessage = lastNonOnlineStatus
                ? `Timed out waiting for Day1x orderbook for ${market} (last status: ${lastNonOnlineStatus})`
                : `Timed out waiting for Day1x orderbook for ${market}`
            logDay1xSocket('request timed out', { market, timeoutMs: DAY1X_SOCKET_TIMEOUT_MS })
            settleWithError(new Error(timeoutMessage))
        }, DAY1X_SOCKET_TIMEOUT_MS)

        const cleanup = () => {
            clearTimeout(timeout)
            socket.onopen = null
            socket.onmessage = null
            socket.onerror = null
            socket.onclose = null
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                logDay1xSocket('closing socket', { market, readyState: socket.readyState })
                socket.close()
            }
        }

        const settleWithError = (error: Error) => {
            if (settled) {
                return
            }
            settled = true
            logDay1xSocket('settling with error', { market, error: error.message })
            cleanup()
            reject(error)
        }

        const settleWithValue = (orderbook: OrderBook) => {
            if (settled) {
                return
            }
            settled = true
            logDay1xSocket('settling with value', {
                market,
                asks: orderbook.asks.length,
                bids: orderbook.bids.length,
                timestamp: orderbook.timestamp,
            })
            cleanup()
            resolve(orderbook)
        }

        socket.onopen = () => {
            try {
                const subscriptionPayload = {
                    reqid: Date.now(),
                    streams: [
                        {
                            Counterparty: DAY1X_SOCKET_COUNTERPARTY,
                            Depth: DAY1X_SOCKET_DEPTH,
                            Symbol: day1xSymbol,
                            Throttle: DAY1X_SOCKET_THROTTLE,
                            name: 'CustomerMarketDataSnapshot',
                        },
                    ],
                    type: 'subscribe',
                }
                logDay1xSocket('socket opened, sending subscription', {
                    market,
                    payload: subscriptionPayload,
                })
                socket.send(JSON.stringify(subscriptionPayload))
            } catch (error) {
                settleWithError(error as Error)
            }
        }

        socket.onmessage = (event) => {
            const decodedPayload = decodePayload(event.data)
            if (!decodedPayload) {
                logDay1xSocket('received undecodable message', {
                    market,
                    payloadType: typeof event.data,
                })
                return
            }

            logDay1xSocket('received message', {
                market,
                payloadPreview: decodedPayload.length > 300 ? `${decodedPayload.slice(0, 300)}...` : decodedPayload,
            })

            let parsedPayload: unknown
            try {
                parsedPayload = JSON.parse(decodedPayload)
            } catch {
                logDay1xSocket('failed to parse message as JSON', { market })
                return
            }

            if (!isRecord(parsedPayload)) {
                logDay1xSocket('ignoring non-object message payload', { market })
                return
            }

            const message = parsedPayload as Day1xMessage
            if (message.type === 'error') {
                const errorMessage =
                    message.error && isRecord(message.error) && typeof message.error.msg === 'string'
                        ? message.error.msg
                        : 'Day1x websocket subscription failed'
                logDay1xSocket('received websocket error message', { market, errorMessage })
                settleWithError(new Error(errorMessage))
                return
            }

            if (message.type !== 'CustomerMarketDataSnapshot') {
                logDay1xSocket('ignoring non-snapshot message', { market, type: message.type })
                return
            }

            const snapshots = Array.isArray(message.data) ? message.data : [message.data]
            const fallbackTimestamp = toTimestamp(message.ts)

            for (const snapshot of snapshots) {
                if (!isRecord(snapshot)) {
                    continue
                }

                if (typeof snapshot.Symbol !== 'string' || snapshot.Symbol.toUpperCase() !== day1xSymbol) {
                    logDay1xSocket('ignoring snapshot for different symbol', {
                        market,
                        snapshotSymbol: snapshot.Symbol,
                    })
                    continue
                }

                const status = typeof snapshot.Status === 'string' ? snapshot.Status : undefined
                if (status && status !== 'Online') {
                    lastNonOnlineStatus = status
                    logDay1xSocket('market reported non-online status', { market, status })
                }

                const timestamp = toTimestamp(snapshot.Timestamp) ?? fallbackTimestamp ?? Date.now()
                const orderbook: OrderBook = {
                    asks: parseLevels(snapshot.Offers, 'asks'),
                    bids: parseLevels(snapshot.Bids, 'bids'),
                    datetime: new Date(timestamp).toISOString(),
                    nonce: timestamp,
                    timestamp,
                }

                if (orderbook.bids.length === 0 && orderbook.asks.length === 0) {
                    if (status && status !== 'Online') {
                        logDay1xSocket('non-online snapshot had empty orderbook, waiting for next snapshot', {
                            market,
                            status,
                        })
                        continue
                    }

                    logDay1xSocket('received empty orderbook snapshot', { market })
                    settleWithError(new Error(`Day1x market ${market} returned an empty orderbook`))
                    return
                }

                if (status && status !== 'Online') {
                    logDay1xSocket('using non-online snapshot because orderbook contains levels', {
                        market,
                        status,
                    })
                }

                logDay1xSocket('received valid orderbook snapshot', {
                    market,
                    asks: orderbook.asks.length,
                    bids: orderbook.bids.length,
                })

                settleWithValue(orderbook)
                return
            }
        }

        socket.onerror = () => {
            logDay1xSocket('socket error event received', { market })
            settleWithError(new Error('Day1x websocket error event received'))
        }

        socket.onclose = (event) => {
            logDay1xSocket('socket closed', {
                market,
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean,
                settled,
            })
            if (settled) {
                return
            }

            settleWithError(new Error(`Day1x websocket closed before snapshot (code=${event.code})`))
        }
    })
}

function logDay1xSocket(message: string, context?: Record<string, unknown>) {
    if (!DAY1X_SOCKET_DEBUG) {
        return
    }

    if (context) {
        console.debug(`[day1x socket] ${message}`, context)
        return
    }

    console.debug(`[day1x socket] ${message}`)
}

function logDay1xRest(message: string, context?: Record<string, unknown>) {
    if (!DAY1X_SOCKET_DEBUG) {
        return
    }

    if (context) {
        console.debug(`[day1x rest] ${message}`, context)
        return
    }

    console.debug(`[day1x rest] ${message}`)
}

function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    if (typeof error === 'string') {
        return error
    }

    return 'Unknown error'
}

function parseLevels(levels: unknown, side: 'bids' | 'asks'): [number, number][] {
    if (!Array.isArray(levels) || levels.length === 0) {
        return []
    }

    const parsedLevels = levels
        .map((level) => {
            if (Array.isArray(level)) {
                const [price, size] = level as unknown[]
                const parsedPrice = toFiniteNumber(price)
                const parsedSize = toFiniteNumber(size)
                if (parsedPrice === undefined || parsedSize === undefined || parsedPrice <= 0 || parsedSize <= 0) {
                    return undefined
                }
                return [parsedPrice, parsedSize] as [number, number]
            }

            if (!isRecord(level)) {
                return undefined
            }

            const parsedPrice = toFiniteNumber(level.Price ?? level.price)
            const parsedSize = toFiniteNumber(level.Size ?? level.size ?? level.amount)

            if (parsedPrice === undefined || parsedSize === undefined || parsedPrice <= 0 || parsedSize <= 0) {
                return undefined
            }

            return [parsedPrice, parsedSize] as [number, number]
        })
        .filter((level): level is [number, number] => level !== undefined)

    if (side === 'bids') {
        parsedLevels.sort((a, b) => b[0] - a[0])
        return parsedLevels
    }

    parsedLevels.sort((a, b) => a[0] - b[0])
    return parsedLevels
}

function toDay1xSymbol(market: string): string {
    return market.replace('/', '-').toUpperCase()
}

function decodePayload(payload: unknown): string | undefined {
    if (typeof payload === 'string') {
        return payload
    }

    if (payload instanceof ArrayBuffer) {
        return new TextDecoder().decode(payload)
    }

    if (ArrayBuffer.isView(payload)) {
        return new TextDecoder().decode(payload)
    }

    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(payload)) {
        return payload.toString('utf-8')
    }

    return undefined
}

function toFiniteNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined
    }

    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : undefined
    }

    return undefined
}

function toTimestamp(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined
    }

    if (typeof value === 'string') {
        const parsed = Date.parse(value)
        return Number.isFinite(parsed) ? parsed : undefined
    }

    return undefined
}

function isRecord(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null
}

function toPositiveInteger(value: string | undefined, fallback: number): number {
    const parsed = Number(value)
    if (Number.isInteger(parsed) && parsed > 0) {
        return parsed
    }

    return fallback
}
