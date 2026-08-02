import { captureException } from '@sentry/nextjs'
import { getBestOrders } from '@/lib/utils'
import type { PriceQueryError, PriceQueryErrorDetail, PriceQueryStreamEvent } from '@/types/price-query'
import { orderbookMethods, supportedExchanges } from './exchanges'
import { DEFAULT_REMOTE_DISABLED_REASON, getRemoteDisabledExchanges } from './exchanges/remote-config'
import type { ExchangeResult } from './types'

export const maxDuration = 30

const PRICE_QUERY_TIMEOUT_MS = 15_000

interface PriceQueryRequestBody {
    amount?: number | string
    base?: string
    fees?: Record<string, number>
    omitExchanges?: string[]
    quote?: string
    side?: string
}

interface OrderbookResult {
    error?: unknown
    value?: ExchangeResult
}

export async function POST(request: Request): Promise<Response> {
    const data: PriceQueryRequestBody = await request.json()
    const { fees = {}, base, quote, side, amount, omitExchanges = [] } = data
    const isValidQuery = base && quote && amount !== undefined && (side === 'buy' || side === 'sell')

    if (!isValidQuery) {
        return createPriceQueryStream({
            amount: '0',
            base: '',
            exchanges: [],
            fees,
            quote: '',
            remoteErrors: [],
            side: 'buy',
        })
    }

    const amountValue = typeof amount === 'number' ? amount.toString() : amount
    const userOmittedExchanges = new Set(Array.isArray(omitExchanges) ? omitExchanges : [])
    const remoteDisabledExchanges = await getRemoteDisabledExchanges(supportedExchanges)
    const remoteDisabledExchangeIds = new Set(remoteDisabledExchanges.map(({ id }) => id))
    const exchanges = supportedExchanges.filter(
        (exchange) => !(userOmittedExchanges.has(exchange) || remoteDisabledExchangeIds.has(exchange)),
    )
    const remoteErrors: PriceQueryError[] = remoteDisabledExchanges
        .filter(({ id }) => !userOmittedExchanges.has(id))
        .map(({ id, reason }) => ({
            name: id,
            error: { name: reason ?? DEFAULT_REMOTE_DISABLED_REASON },
        }))

    return createPriceQueryStream({
        amount: amountValue,
        base,
        exchanges,
        fees,
        quote,
        remoteErrors,
        side,
    })
}

interface StreamOptions {
    amount: string
    base: string
    exchanges: string[]
    fees: Record<string, number>
    quote: string
    remoteErrors: PriceQueryError[]
    side: 'buy' | 'sell'
}

function createPriceQueryStream(options: StreamOptions): Response {
    const encoder = new TextEncoder()
    let cancelled = false

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            const send = (event: PriceQueryStreamEvent): void => {
                if (!cancelled) {
                    controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
                }
            }

            send({ type: 'start', total: options.exchanges.length })

            const run = async (): Promise<void> => {
                const orderbooks: Record<string, OrderbookResult> = {}
                const exchangeErrors: PriceQueryError[] = []
                let completed = 0

                const settleExchange = async (exchange: string): Promise<void> => {
                    try {
                        const value = await withTimeout(
                            orderbookMethods[exchange]?.(
                                options.base,
                                options.quote,
                                options.side,
                                options.amount,
                                options.fees[exchange],
                            ),
                            exchange,
                        )
                        if (isExchangeError(value)) {
                            exchangeErrors.push({ name: exchange, error: normalizeError(value.error) })
                            orderbooks[exchange] = { error: value.error }
                        } else {
                            orderbooks[exchange] = { value }
                        }
                    } catch (error) {
                        if (!shouldIgnoreSentry(error)) {
                            captureException(error)
                        }
                        exchangeErrors.push({ name: exchange, error: normalizeError(error) })
                        orderbooks[exchange] = { error }
                    }

                    completed += 1
                    const result = calculateResult(options, orderbooks, exchangeErrors)
                    send({
                        type: 'snapshot',
                        completed,
                        total: options.exchanges.length,
                        exchange,
                        ...result,
                    })
                }

                await Promise.all(options.exchanges.map(settleExchange))
                const result = calculateResult(options, orderbooks, exchangeErrors)
                send({
                    type: 'complete',
                    completed,
                    total: options.exchanges.length,
                    ...result,
                })
                if (!cancelled) {
                    controller.close()
                }
            }

            run().catch((error: unknown) => {
                captureException(error)
                if (!cancelled) {
                    controller.error(error)
                }
            })
        },
        cancel() {
            cancelled = true
        },
    })

    return new Response(stream, {
        headers: {
            'Cache-Control': 'no-store',
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
        },
    })
}

function calculateResult(
    options: StreamOptions,
    orderbooks: Record<string, OrderbookResult>,
    exchangeErrors: PriceQueryError[],
): Pick<Extract<PriceQueryStreamEvent, { type: 'complete' }>, 'best' | 'errors'> {
    const { sortedBests, orderbookErrors } = getBestOrders(
        orderbooks,
        Number.parseFloat(options.amount),
        options.fees,
        options.base,
        options.quote,
        options.side,
        options.base,
    )
    return {
        best: sortedBests,
        errors: [...exchangeErrors, ...orderbookErrors, ...options.remoteErrors],
    }
}

function normalizeError(error: unknown): PriceQueryErrorDetail {
    if (error instanceof Error) {
        return { name: error.name, message: error.message }
    }
    if (typeof error === 'string') {
        return { name: error, message: error }
    }
    if (error && typeof error === 'object' && 'name' in error && typeof error.name === 'string') {
        return { name: error.name }
    }
    return { name: 'Unknown error' }
}

function shouldIgnoreSentry(error: unknown): boolean {
    return Boolean(error && typeof error === 'object' && 'sentryIgnore' in error && error.sentryIgnore)
}

function isExchangeError(value: ExchangeResult | undefined): value is { error: string } {
    return typeof value === 'object' && value !== null && 'error' in value && typeof value.error === 'string'
}

function withTimeout<T>(promise: Promise<T> | undefined, exchange: string): Promise<T | undefined> {
    if (!promise) {
        return Promise.resolve(undefined)
    }

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`${exchange} price query timed out after ${PRICE_QUERY_TIMEOUT_MS}ms`))
        }, PRICE_QUERY_TIMEOUT_MS)

        promise.then(resolve, reject).finally(() => {
            clearTimeout(timeout)
        })
    })
}
