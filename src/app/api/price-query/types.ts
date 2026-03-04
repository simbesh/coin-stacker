export type OrderBookLevel = [number, number]

export interface OrderBook {
    asks: OrderBookLevel[]
    bids: OrderBookLevel[]
    datetime?: string
    nonce?: number
    timestamp?: number
}

export interface ExchangeOrderBookError {
    error: string
}

export type ExchangeResult = ExchangeOrderBookError | OrderBook

export type ExchangeHandler = (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number,
) => Promise<ExchangeResult | undefined>

export class MarketNotFoundError extends Error {
    sentryIgnore = true

    constructor(symbol: string, exchangeId: string) {
        super(`Symbol ${symbol} not found in ${exchangeId}`)
        this.name = 'MarketNotFoundError'
    }
}
