import { independentreserve } from 'ccxt'
import type { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getIndependentReserveOrderBook: ExchangeHandler = (base: string, quote: string) => {
    const exchange = new independentreserve()
    return getOrderBook(exchange, `${base}/${quote}`)
}
