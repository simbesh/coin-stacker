import { parseCjOrderBook } from '@/lib/utils'
import { CjOrderBookResponse } from '@/types/types'
import { ExchangeHandler } from '../types'

export const getCoinJarOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const res = await fetch(`https://data.exchange.coinjar.com/products/${base}${quote}/book?level=2`)
    const json: CjOrderBookResponse = await res.json()
    if ('error_type' in json) {
        throw new Error(json.error_messages[0])
    }
    return parseCjOrderBook(json)
}
