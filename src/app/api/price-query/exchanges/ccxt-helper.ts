import type { Exchange } from 'ccxt'
import type { OrderBook, OrderBookLevel } from '../types'
import { MarketNotFoundError } from '../types'

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args)

const toFiniteNumber = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return undefined
}

const toOrderBookLevels = (levels: unknown): OrderBookLevel[] => {
    if (!Array.isArray(levels)) {
        return []
    }

    const normalizedLevels: OrderBookLevel[] = []
    for (const level of levels) {
        if (!Array.isArray(level)) {
            continue
        }

        const price = toFiniteNumber(level[0])
        const amount = toFiniteNumber(level[1])
        if (price !== undefined && amount !== undefined) {
            normalizedLevels.push([price, amount])
        }
    }

    return normalizedLevels
}

export const getOrderBook = async (exchange: Exchange, symbol: string): Promise<OrderBook> => {
    exchange.fetchImplementation = fetcher
    await exchange.loadMarkets()

    const markets = exchange.markets ?? {}
    if (symbol in markets) {
        const orderBook = await exchange.fetchOrderBook(symbol)
        const nonce = toFiniteNumber(orderBook.nonce)
        const timestamp = toFiniteNumber(orderBook.timestamp)

        return {
            asks: toOrderBookLevels(orderBook.asks),
            bids: toOrderBookLevels(orderBook.bids),
            datetime: orderBook.datetime ?? undefined,
            nonce,
            timestamp,
        }
    }

    console.error(`Symbol ${symbol} not found in ${exchange.id}`)
    throw new MarketNotFoundError(symbol, exchange.id)
}
