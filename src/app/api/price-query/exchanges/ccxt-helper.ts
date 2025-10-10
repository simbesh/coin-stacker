import { Exchange } from 'ccxt'
import { MarketNotFoundError } from '../types'

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args)

export const getOrderBook = async (exchange: Exchange, symbol: string) => {
    exchange.fetchImplementation = fetcher
    await exchange.loadMarkets()
    if (symbol in exchange.markets) {
        return exchange.fetchOrderBook(symbol)
    } else {
        console.error(`Symbol ${symbol} not found in ${exchange.id}`)
        throw new MarketNotFoundError(symbol, exchange.id)
    }
}
