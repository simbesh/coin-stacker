export interface OrderBook {
    bids: any[]
    asks: any[]
    timestamp?: number
    datetime?: string
    nonce?: number
}

export interface ExchangeHandler {
    (base: string, quote: string, side?: string, amount?: string, fee?: number): Promise<any>
}

export class MarketNotFoundError extends Error {
    sentryIgnore = true

    constructor(symbol: string, exchangeId: string) {
        super(`Symbol ${symbol} not found in ${exchangeId}`)
        this.name = 'MarketNotFoundError'
    }
}
