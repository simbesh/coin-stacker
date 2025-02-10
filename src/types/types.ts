export type CsOrderBookResponse = CsOrderBookResponseOk | CsOrderBookResponseError

export interface CsOrderBookResponseOk {
    status: 'ok'
    buyorders: Array<OrderBookLevel>
    sellorders: Array<OrderBookLevel>
}
export interface CsOrderBookResponseError {
    status: 'error'
    message: string
}

export interface CjOrderBookResponse {
    asks: [string, string][]
    bids: [string, string][]
}

export interface BrOrderBookResponse {
    buy: BrOrderBookLevel[]
    sell: BrOrderBookLevel[]
}

export interface SwOrdersResponse {
    price: string
    total: string
    amount: string
    feePerUnit: string
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
    quote?: string
}

export interface CoinstashQuotes {
    quoteId: string
    issuedOn: Date
    targetCurrency: string
    prices?: { [key: string]: Price }
}

//{"status":true,"buy":157884.39,"sell":154140.09,"market":155700.84,"spot":156012.24}
export interface HardblockTicker {
    status: boolean
    buy: number
    sell: number
    market: number
    spot: number
}

export interface CointreeQuotes {
    sell: string
    buy: string
    ask: number
    bid: number
    rate: number
    spotRate: number
    market: string
    timestamp: string
    rateType: string
    rateSteps: string
}

export interface Price {
    coinId: string
    symbol: string
    coinUrl: null | string
    tickerPrice: number
    buyPrice: number
    sellPrice: number
    buyPricePrecise: string
    sellPricePrecise: string
    tickerPricePrecise: string
    percentage_1H: number
    percentage_24H: number | null
    percentage_7D: number | null
    percentage_30D: number | null
    marketCap: number
    circulatingSupply: number
    tradingVolume_24H: number
}
