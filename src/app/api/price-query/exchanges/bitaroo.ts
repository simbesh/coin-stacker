import { parseBrOrderBook } from '@/lib/utils'
import { BrOrderBookResponse } from '@/types/types'
import { ExchangeHandler, MarketNotFoundError } from '../types'

export const getBitarooOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    if (base !== 'BTC' || quote !== 'AUD') {
        throw new MarketNotFoundError(`${base}/${quote}`, 'bitaroo')
    }

    const res = await fetch(`https://api.bitaroo.com.au/v1/market/order-book`)
    const json: BrOrderBookResponse = await res.json()
    return parseBrOrderBook(json)
}
