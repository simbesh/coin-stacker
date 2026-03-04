export type CsOrderBookResponse = CsOrderBookResponseOk | CsOrderBookResponseError

export interface CsOrderBookResponseOk {
    buyorders: Array<OrderBookLevel>
    sellorders: Array<OrderBookLevel>
    status: 'ok'
}
export interface CsOrderBookResponseError {
    message: string
    status: 'error'
}

export type CjOrderBookResponse =
    | {
          asks: [string, string][]
          bids: [string, string][]
      }
    | {
          error_type: string // "NOT_FOUND"
          error_messages: string[]
      }

export interface BrOrderBookResponse {
    buy: BrOrderBookLevel[]
    sell: BrOrderBookLevel[]
}

export interface D1OrderBookResponse {
    asks: [string, string][]
    bids: [string, string][]
    timestamp: number
}

export interface WayexOrderBookResponse {
    // AlphaPoint L2 Snapshot returns an array where:
    // Even indices (0, 2, 4...) are bids
    // Odd indices (1, 3, 5...) are asks
    // Each entry is an array of [price, quantity, ...]
    [index: number]: number[][]
}

export interface SwOrdersResponse {
    amount: string
    feePerUnit: string
    price: string
    total: string
}

interface BrOrderBookLevel {
    amount: string
    price: string
}

export interface OrderBookLevel {
    amount: number
    coin: string
    created: number
    market: string
    rate: number
    total: number
}

export type PriceQueryParams = {
    side: 'buy' | 'sell'
    amount: string
    coin: string
    quote?: string
}

export interface CoinstashQuotes {
    issuedOn: Date
    prices?: { [key: string]: Price }
    quoteId: string
    targetCurrency: string
}

//{"status":true,"buy":157884.39,"sell":154140.09,"market":155700.84,"spot":156012.24}
export interface HardblockTicker {
    buy: number
    market: number
    sell: number
    spot: number
    status: boolean
}

export interface CointreeQuotes {
    ask: number
    bid: number
    buy: string
    market: string
    rate: number
    rateSteps: string
    rateType: string
    sell: string
    spotRate: number
    timestamp: string
}

export interface Price {
    buyPrice: number
    buyPricePrecise: string
    circulatingSupply: number
    coinId: string
    coinUrl: null | string
    marketCap: number
    percentage_1H: number
    percentage_7D: number | null
    percentage_24H: number | null
    percentage_30D: number | null
    sellPrice: number
    sellPricePrecise: string
    symbol: string
    tickerPrice: number
    tickerPricePrecise: string
    tradingVolume_24H: number
}
