import { kucoin } from 'ccxt'
import type { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getKucoinOrderBook: ExchangeHandler = (base: string, quote: string) => {
    const exchange = new kucoin()
    return getOrderBook(exchange, `${base}/${quote}`)
}
