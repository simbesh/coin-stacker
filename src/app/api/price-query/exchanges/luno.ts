import { luno } from 'ccxt'
import type { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getLunoOrderBook: ExchangeHandler = (base: string, quote: string) => {
    const exchange = new luno()
    return getOrderBook(exchange, `${base}/${quote}`)
}
