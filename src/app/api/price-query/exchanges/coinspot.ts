import { parseCsOrderBook } from '@/lib/utils'
import type { CsOrderBookResponse } from '@/types/types'
import { type ExchangeHandler, MarketNotFoundError } from '../types'

export const getCoinSpotOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const res = await fetch(`https://www.coinspot.com.au/pubapi/v2/orders/open/${base}/${quote}`)
    const json: CsOrderBookResponse = await res.json()
    if (!res.ok) {
        if (res.status === 400) {
            throw new MarketNotFoundError(`${base}/${quote}`, 'coinspot')
        }
        throw new Error(res.statusText)
    }
    if ('buyorders' in json && 'sellorders' in json) {
        return parseCsOrderBook(json)
    }
    if ('message' in json) {
        throw new Error(json.message)
    }
    throw new Error('BUG: Unknown CoinSpot order book response')
}
