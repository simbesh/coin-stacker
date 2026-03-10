import { type ExchangeHandler, MarketNotFoundError, type OrderBookLevel } from '../types'

const PEPPERSTONE_CRYPTO_ORDERBOOK_URL = 'https://nodes.pepperstonecrypto.com/market/get-open-orders'
const PEPPERSTONE_CRYPTO_ORDERBOOK_DEPTH = 50

type PepperstoneSide = 'BUY' | 'SELL'

interface PepperstoneOrder {
    CurrencyType?: unknown
    MarketType?: unknown
    Rate?: unknown
    Volume?: unknown
}

interface PepperstoneOrderBookResponse {
    data?: {
        Orders?: unknown
        Pair?: unknown
        Type?: unknown
    } | null
    errorMessage?: unknown
    status?: unknown
}

export const getPepperstoneCryptoOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const symbol = `${base}/${quote}`
    const pair = `${quote}_${base}`

    const [bids, asks] = await Promise.all([
        fetchPepperstoneCryptoLevels(pair, symbol, quote, base, 'BUY'),
        fetchPepperstoneCryptoLevels(pair, symbol, quote, base, 'SELL'),
    ])

    const timestamp = Date.now()
    return {
        asks,
        bids,
        datetime: new Date(timestamp).toISOString(),
        nonce: timestamp,
        timestamp,
    }
}

async function fetchPepperstoneCryptoLevels(
    pair: string,
    symbol: string,
    marketType: string,
    currencyType: string,
    side: PepperstoneSide,
): Promise<OrderBookLevel[]> {
    const response = await fetch(
        `${PEPPERSTONE_CRYPTO_ORDERBOOK_URL}/${pair}/${side}/${PEPPERSTONE_CRYPTO_ORDERBOOK_DEPTH}`,
    )

    if (!response.ok) {
        if (response.status === 404) {
            throw new MarketNotFoundError(symbol, 'pepperstonecrypto')
        }

        throw new Error(`Pepperstone Crypto API error: ${response.status}`)
    }

    const json: PepperstoneOrderBookResponse = await response.json()

    if (json.status !== 'Success') {
        const errorMessage = typeof json.errorMessage === 'string' ? json.errorMessage : 'Pepperstone Crypto API error'

        if (errorMessage.toLowerCase().includes('invalid market_currency pair')) {
            throw new MarketNotFoundError(symbol, 'pepperstonecrypto')
        }

        throw new Error(errorMessage)
    }

    if (!json.data || json.data.Pair !== pair || json.data.Type !== side) {
        throw new Error(`Pepperstone Crypto returned an invalid ${side} order book payload for ${symbol}`)
    }

    return parsePepperstoneCryptoLevels(json.data.Orders, marketType, currencyType, side)
}

function parsePepperstoneCryptoLevels(
    orders: unknown,
    marketType: string,
    currencyType: string,
    side: PepperstoneSide,
): OrderBookLevel[] {
    if (!Array.isArray(orders)) {
        return []
    }

    const levels: OrderBookLevel[] = []

    for (const order of orders) {
        if (!isPepperstoneOrder(order, marketType, currencyType)) {
            continue
        }

        const price = toFiniteNumber(order.Rate)
        const amount = toFiniteNumber(order.Volume)

        if (price === undefined || amount === undefined || price <= 0 || amount <= 0) {
            continue
        }

        levels.push([price, amount])
    }

    levels.sort((left, right) => (side === 'BUY' ? right[0] - left[0] : left[0] - right[0]))
    return levels
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

function isPepperstoneOrder(order: unknown, marketType: string, currencyType: string): order is PepperstoneOrder {
    if (!isRecord(order)) {
        return false
    }

    if (order.MarketType !== undefined && order.MarketType !== marketType) {
        return false
    }

    if (order.CurrencyType !== undefined && order.CurrencyType !== currencyType) {
        return false
    }

    return true
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}
