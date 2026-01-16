import { binance } from 'ccxt'
import { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getBinanceOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const exchange = new binance()
    return getOrderBook(exchange, `${base}/${quote}`)
}
