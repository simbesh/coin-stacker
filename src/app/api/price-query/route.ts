import { getBestOrders, parseBrOrderBook, parseCjOrderBook, parseCsOrderBook, toIsoString } from '@/lib/utils'
import {
    BrOrderBookResponse,
    CjOrderBookResponse,
    CoinstashQuotes,
    CointreeQuotes,
    CsOrderBookResponse,
    HardblockTicker,
    SwOrdersResponse,
} from '@/types/types'
import * as Sentry from '@sentry/nextjs'
import { sql } from '@vercel/postgres'
import { btcmarkets, Exchange, independentreserve, kraken, luno, okx } from 'ccxt'
import { differenceInDays } from 'date-fns'
import { NextResponse } from 'next/server'
import { json } from 'stream/consumers'

const supportedExchanges = [
    'btcmarkets',
    'independentreserve',
    'kraken',
    'luno',
    'coinspot',
    'coinjar',
    'bitaroo',
    'swyftx',
    'coinstash',
    'cointree',
    'digitalsurge',
    'okx',
    'hardblock',
    'elbaite',
]

const cointreeOrderLimit: Record<string, number> = {
    AUD: 52_500,
    USDT: 35_000,
    USDC: 35_000,
}

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args)

class MarketNotFoundError extends Error {
    sentryIgnore = true

    constructor(symbol: string, exchangeId: string) {
        super(`Symbol ${symbol} not found in ${exchangeId}`)
        this.name = 'MarketNotFoundError'
    }
}

class NotImplementedError extends Error {
    sentryIgnore = true

    constructor(exchangeId: string) {
        super(`${exchangeId} not implemented`)
        this.name = 'Coming soon..'
    }
}

const getOrderBook = async (exchange: Exchange, symbol: string) => {
    exchange.fetchImplementation = fetcher
    await exchange.loadMarkets()
    if (symbol in exchange.markets) {
        return exchange.fetchOrderBook(symbol)
    } else {
        console.error(`Symbol ${symbol} not found in ${exchange.id}`)
        throw new MarketNotFoundError(symbol, exchange.id)
    }
}

const getBTCMarketsOrderBook = async (base: string, quote: string) => {
    const exchange = new btcmarkets()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getIndependentReserveOrderBook = async (base: string, quote: string) => {
    const exchange = new independentreserve()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getKrakenOrderBook = async (base: string, quote: string) => {
    const exchange = new kraken()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getLunoOrderBook = async (base: string, quote: string) => {
    const exchange = new luno()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getOkxOrderBook = async (base: string, quote: string) => {
    const exchange = new okx()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getCoinSpotOrderBook = async (base: string, quote: string) => {
    const res = await fetch(`https://www.coinspot.com.au/pubapi/v2/orders/open/${base}/${quote}`)
    const json: CsOrderBookResponse = await res.json()
    if ('buyorders' in json && 'sellorders' in json) {
        return parseCsOrderBook(json)
    } else if ('message' in json) {
        throw new Error(json.message)
    } else {
        throw new Error('BUG: Unknown CoinSpot order book response')
    }
}

const getCoinJarOrderBook = async (base: string, quote: string) => {
    const res = await fetch(`https://data.exchange.coinjar.com/products/${base}${quote}/book?level=2`)
    const json: CjOrderBookResponse = await res.json()
    return parseCjOrderBook(json)
}
const getBitarooOrderBook = async (base: string, quote: string) => {
    if (base !== 'BTC' || quote !== 'AUD') {
        return
    }

    const res = await fetch(`https://api.bitaroo.com.au/v1/market/order-book`)
    const json: BrOrderBookResponse = await res.json()
    return parseBrOrderBook(json)
}

const getSwyftxMockOrderBook = async (base: string, quote: string, side?: string, amount?: string, fee?: number) => {
    if (fee !== undefined) {
        let token
        const cached = await getCachedSwyftxKey()
        if (cached && differenceInDays(new Date(), cached.updated_at) >= 7) {
            const accessToken = await refreshSwyftxToken()
            if (accessToken) {
                await updateCachedSwyftxKey(accessToken)
                token = accessToken
            }
        } else {
            token = cached?.refresh_key
        }

        if (token) {
            try {
                const res = await fetch(`https://api.swyftx.com.au/orders/rate/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                        'user-agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                    },
                    body: JSON.stringify({
                        buy: side === 'buy' ? base : quote,
                        sell: side === 'buy' ? quote : base,
                        amount,
                        limit: base,
                    }),
                })

                const json: SwOrdersResponse = await res.json()
                if (side === 'buy') {
                    return {
                        asks: [[parseFloat(json.price), parseFloat(json.amount)]],
                    }
                } else {
                    return {
                        bids: [
                            [(parseFloat(json.amount) / parseFloat(json.total)) * (1 + fee), parseFloat(json.total)],
                        ],
                    }
                }
            } catch (e) {
                console.error('e', e)
            }
        }
    }
}

const getCoinstashMockOrderBook = async (base: string, quote: string, side?: string, amount?: string, fee?: number) => {
    if (fee !== undefined && amount !== undefined) {
        const res = await fetch(`https://api.coinstash.com.au/oracle/v1/quotes/last/${quote}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
        })

        const json: CoinstashQuotes = await res.json()
        const baseLowerCase = base.toLowerCase()
        if (json.prices?.[baseLowerCase] !== undefined) {
            if (side === 'buy') {
                return {
                    asks: [[json.prices[baseLowerCase]!.buyPrice, parseFloat(amount)]],
                }
            } else {
                return {
                    bids: [[json.prices[baseLowerCase]!.sellPrice, parseFloat(amount)]],
                }
            }
        }
    }
}

const getHardblockMockOrderBook = async (base: string, quote: string, side?: string, amount?: string, fee?: number) => {
    if (base === 'BTC' && quote === 'AUD' && fee !== undefined && amount !== undefined) {
        const res = await fetch(`https://www.hardblock.com.au/sluh/ticker`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
        })

        const { status, buy, sell }: HardblockTicker = await res.json()
        if (status) {
            return side === 'buy'
                ? {
                      asks: [[buy, parseFloat(amount)]],
                  }
                : {
                      bids: [[sell, parseFloat(amount)]],
                  }
        }
    }
}

const getCointreeMockOrderBook = async (base: string, quote: string, side?: string, amount?: string, fee?: number) => {
    const liquidityLimit = cointreeOrderLimit[quote]
    if (fee !== undefined && amount !== undefined && liquidityLimit !== undefined) {
        const res = await fetch(`https://trade.cointree.com/api/prices/${base}/${quote}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
        })

        const json: CointreeQuotes = await res.json()
        let price
        if (quote === 'AUD') {
            price = side === 'buy' ? json.ask : json.bid
        } else {
            price = side === 'sell' ? 1 / json.ask : 1 / json.bid
        }
        const key = side === 'buy' ? 'asks' : 'bids'
        if (amount && price * Number(amount) < liquidityLimit) {
            return {
                [key]: [[price, Number(amount)]],
            }
        }
    }
}
const getDigitalSurgeMockOrderBook = async (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number
) => {
    if (fee !== undefined && amount !== undefined && side && quote === 'AUD') {
        const assetsRes = await fetch(`https://digitalsurge.com.au/api/public/broker/assets/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
        })
        const assets = await assetsRes.json()
        const max_order_size_value = assets.results.find((x: any) => x.code === base)?.max_order_size_value
        if (max_order_size_value) {
            const res = await fetch(`https://digitalsurge.com.au/api/public/broker/ticker/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                },
            })
            const tickerData: Record<string, any> = await res.json()
            const price = tickerData[base]?.[side]
            if (price) {
                const key = side === 'buy' ? 'asks' : 'bids'
                if (amount && price * Number(amount) < Number(max_order_size_value)) {
                    return {
                        [key]: [[price, Number(amount)]],
                    }
                }
            }
        }
    }
}

const orderbookMethods: Record<
    string,
    (base: string, quote: string, side?: string, amount?: string, fee?: number) => Promise<any>
> = {
    btcmarkets: getBTCMarketsOrderBook,
    independentreserve: getIndependentReserveOrderBook,
    kraken: getKrakenOrderBook,
    luno: getLunoOrderBook,
    coinspot: getCoinSpotOrderBook,
    coinjar: getCoinJarOrderBook,
    bitaroo: getBitarooOrderBook,
    swyftx: getSwyftxMockOrderBook,
    coinstash: getCoinstashMockOrderBook,
    cointree: getCointreeMockOrderBook,
    digitalsurge: getDigitalSurgeMockOrderBook,
    okx: getOkxOrderBook,
    hardblock: getHardblockMockOrderBook,
}

export async function POST(request: Request): Promise<NextResponse<any>> {
    const data = await request.json()
    const { fees, base, quote, side, amount, omitExchanges } = data
    const errors: Record<string, any>[] = []
    let best
    if (base && quote && amount && side) {
        const exchanges = supportedExchanges.filter((e) => !omitExchanges.includes(e))
        const promises = exchanges.map((exchange) =>
            orderbookMethods[exchange]?.(base, quote, side, amount, fees[exchange])
        )

        const orderbooks: Record<string, { value?: any; error?: any }> = {}
        const results: PromiseSettledResult<string>[] = await Promise.allSettled(promises)
        results.forEach((result: PromiseSettledResult<any>, i) => {
            const exchange = exchanges[i]
            if (exchange !== undefined) {
                if (result.status === 'fulfilled') {
                    orderbooks[exchange] = {
                        value: result.value,
                    }
                } else {
                    console.error(`Error from ${exchange}:`, result.reason.toString())
                    if (!result.reason?.sentryIgnore) {
                        Sentry.captureException(result.reason, data)
                    }
                    errors.push({ name: exchange, error: result.reason.toString() })
                    orderbooks[exchange] = {
                        error: result.reason,
                    }
                }
            }
        })

        const { sortedBests, orderbookErrors } = getBestOrders(
            orderbooks,
            parseFloat(amount),
            fees,
            base,
            quote,
            side,
            base
        )
        best = sortedBests
        errors.push(...orderbookErrors)
    }

    return NextResponse.json({ best, errors })
}

async function updateCachedSwyftxKey(key: string) {
    return await sql`UPDATE swyftx
                SET refresh_key = ${key},
                    updated_at = ${toIsoString(new Date())}
                WHERE access_token = '1';`
}

async function getCachedSwyftxKey(): Promise<{ refresh_key: string; updated_at: Date } | undefined> {
    const { rows } = await sql`SELECT refresh_key, updated_at from swyftx WHERE access_token = '1';`
    if (rows.length === 1) {
        return rows[0] as { refresh_key: string; updated_at: Date }
    }
}

async function refreshSwyftxToken() {
    const res = await fetch(`https://api.swyftx.com.au/auth/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
            apiKey: process.env.SWYFTX_API_KEY,
        }),
    })
    const json = await res.json()
    return json.accessToken
}
