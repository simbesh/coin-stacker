import { btcmarkets } from 'ccxt'
import type { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getBTCMarketsOrderBook: ExchangeHandler = (base: string, quote: string) => {
    const exchange = new btcmarkets()
    return getOrderBook(exchange, `${base}/${quote}`)
}
