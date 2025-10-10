import { luno } from 'ccxt'
import { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getLunoOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const exchange = new luno()
    return getOrderBook(exchange, `${base}/${quote}`)
}
