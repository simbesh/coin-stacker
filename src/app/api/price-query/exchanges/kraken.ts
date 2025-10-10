import { kraken } from 'ccxt'
import { ExchangeHandler } from '../types'
import { getOrderBook } from './ccxt-helper'

export const getKrakenOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const exchange = new kraken()
    return getOrderBook(exchange, `${base}/${quote}`)
}
