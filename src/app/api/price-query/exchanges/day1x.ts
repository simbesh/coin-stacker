import { parseD1OrderBook } from '@/lib/utils'
import { D1OrderBookResponse } from '@/types/types'
import { ExchangeHandler, MarketNotFoundError } from '../types'

export const getDay1xOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const res = await fetch(`https://exchange-api.day1x.io/api/coinmarketcap/orderbook/${base}-${quote}`)

    if (!res.ok) {
        if (res.status === 404) {
            throw new MarketNotFoundError(`${base}/${quote}`, 'day1x')
        }
        throw new Error(res.statusText)
    }

    const json: D1OrderBookResponse = await res.json()
    return parseD1OrderBook(json)
}
