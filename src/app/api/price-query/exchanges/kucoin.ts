import { kucoin } from 'ccxt'
import { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getKucoinOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const exchange = new kucoin()
    return getOrderBook(exchange, `${base}/${quote}`)
}
