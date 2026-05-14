import { coinbase } from 'ccxt'
import type { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getCoinbaseOrderBook: ExchangeHandler = (base: string, quote: string) => {
    const exchange = new coinbase()
    return getOrderBook(exchange, `${base}/${quote}`)
}
