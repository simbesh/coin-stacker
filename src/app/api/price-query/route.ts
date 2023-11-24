import { NextResponse } from 'next/server'
import { btcmarkets, Exchange, independentreserve, kraken, luno } from 'ccxt'
import { getBestAsks, getBestBids, parseBrOrderBook, parseCjOrderBook, parseCsOrderBook } from '@/lib/utils'
import { BrOrderBookResponse, CjOrderBookResponse, CsOrderBookResponse } from '@/types/types'

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args)

const getOrderBook = async (exchange: Exchange, symbol: string) => {
    exchange.fetchImplementation = fetcher
    await exchange.loadMarkets()
    if (symbol in exchange.markets) {
        return exchange.fetchOrderBook(symbol)
    }
}

const getBTCMarketsOrderBook = async (base: string, quote: string) => {
    const exchange = new btcmarkets()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getIndependentReserveOrderBook = async (base: string, quote: string) => {
    const exchange = new independentreserve()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getKrakenOrderBook = async (base: string, quote: string) => {
    const exchange = new kraken()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getLunoOrderBook = async (base: string, quote: string) => {
    const exchange = new luno()
    return getOrderBook(exchange, `${base}/${quote}`)
}
const getCoinSpotOrderBook = async (base: string, quote: string) => {
    let res = await fetch(`https://www.coinspot.com.au/pubapi/v2/orders/open/${base}/${quote}`)
    const json: CsOrderBookResponse = await res.json()
    return parseCsOrderBook(json)
}
const getCoinJarOrderBook = async (base: string, quote: string) => {
    let res = await fetch(`https://data.exchange.coinjar.com/products/${base}${quote}/book?level=2`)
    const json: CjOrderBookResponse = await res.json()
    return parseCjOrderBook(json)
}
const getBitarooOrderBook = async (base: string, quote: string) => {
    if (base !== 'BTC' || quote !== 'AUD') {
        return
    }

    let res = await fetch(`https://api.bitaroo.com.au/v1/market/order-book`)
    const json: BrOrderBookResponse = await res.json()
    return parseBrOrderBook(json)
}

export async function POST(request: Request): Promise<NextResponse<any>> {
    const { fees, base, quote, side, amount } = await request.json()
    let best
    if (base && quote && amount && side) {
        let exchanges = ['btcmarkets', 'independentreserve', 'kraken', 'luno', 'coinspot', 'coinjar', 'bitaroo']
        let promises = [
            getBTCMarketsOrderBook(base, quote),
            getIndependentReserveOrderBook(base, quote),
            getKrakenOrderBook(base, quote),
            getLunoOrderBook(base, quote),
            getCoinSpotOrderBook(base, quote),
            getCoinJarOrderBook(base, quote),
            getBitarooOrderBook(base, quote),
        ]

        const orderbooks: Record<string, { value?: any; error?: any }> = {}
        let results: PromiseSettledResult<string>[] = await Promise.allSettled(promises)
        results.forEach((result: PromiseSettledResult<any>, i) => {
            let exchange = exchanges[i]
            if (exchange !== undefined) {
                if (result.status === 'fulfilled') {
                    orderbooks[exchange] = {
                        value: result.value,
                    }
                } else if (result.status === 'rejected') {
                    orderbooks[exchange] = {
                        error: result.reason,
                    }
                }
            }
        })

        best =
            side === 'buy'
                ? getBestAsks(orderbooks, parseFloat(amount), fees)
                : getBestBids(orderbooks, parseFloat(amount), fees)
    }
    6

    return NextResponse.json({ best })
}
