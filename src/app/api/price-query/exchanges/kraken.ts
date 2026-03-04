import { kraken } from 'ccxt'
import type { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getKrakenOrderBook: ExchangeHandler = (base: string, quote: string) => {
    const exchange = new kraken()
    return getOrderBook(exchange, `${base}/${quote}`)
}
