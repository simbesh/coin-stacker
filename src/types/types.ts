export interface CsOrderBookResponse {
    status: string
    buyorders: Array<OrderBookLevel>
    sellorders: Array<OrderBookLevel>
}

export interface CjOrderBookResponse {
    asks: [string, string][]
    bids: [string, string][]
}

export interface BrOrderBookResponse {
    buy: BrOrderBookLevel[]
    sell: BrOrderBookLevel[]
}

interface BrOrderBookLevel {
    price: string
    amount: string
}

export interface OrderBookLevel {
    amount: number
    rate: number
    total: number
    coin: string
    created: number
    market: string
}

export type PriceQueryParams = {
    side: 'buy' | 'sell'
    amount: string
    coin: string
}
