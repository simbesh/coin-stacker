import { okx } from 'ccxt'
import { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getOkxOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const exchange = new okx()
    return getOrderBook(exchange, `${base}/${quote}`)
}
