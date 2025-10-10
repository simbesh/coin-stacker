import { independentreserve } from 'ccxt'
import { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getIndependentReserveOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const exchange = new independentreserve()
    return getOrderBook(exchange, `${base}/${quote}`)
}
