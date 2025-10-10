import { btcmarkets } from 'ccxt'
import { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getBTCMarketsOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const exchange = new btcmarkets()
    return getOrderBook(exchange, `${base}/${quote}`)
}
