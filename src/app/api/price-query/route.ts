import { NextResponse } from 'next/server'
import { btcmarkets, Exchange, independentreserve, kraken, luno } from 'ccxt'
import { getBestAsks, getBestBids, parseBrOrderBook, parseCjOrderBook, parseCsOrderBook } from '@/lib/utils'
import { BrOrderBookResponse, CjOrderBookResponse, CsOrderBookResponse, SwOrdersResponse } from '@/types/types'

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

const getSwyftxMockOrderBook = async (base: string, quote: string, side?: string, amount?: string, fee?: number) => {
    if (fee !== undefined) {
        let res = await fetch(`https://api.swyftx.com.au/orders/rate/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + process.env.SWYFTX_API_KEY,
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
            body: JSON.stringify({
                buy: side === 'buy' ? base : quote,
                sell: side === 'buy' ? quote : base,
                amount,
                limit: base,
            }),
        })

        const json: SwOrdersResponse = await res.json()
        if (side === 'buy') {
            return {
                asks: [[parseFloat(json.price), parseFloat(json.amount)]],
            }
        } else {
            return {
                bids: [[(parseFloat(json.amount) / parseFloat(json.total)) * (1 + fee), parseFloat(json.total)]],
            }
        }
    }
}

const exchangesMethods: Record<
    string,
    (base: string, quote: string, side?: string, amount?: string, fee?: number) => Promise<any>
> = {
    btcmarkets: getBTCMarketsOrderBook,
    independentreserve: getIndependentReserveOrderBook,
    kraken: getKrakenOrderBook,
    luno: getLunoOrderBook,
    coinspot: getCoinSpotOrderBook,
    coinjar: getCoinJarOrderBook,
    bitaroo: getBitarooOrderBook,
    swyftx: getSwyftxMockOrderBook,
}

export async function POST(request: Request): Promise<NextResponse<any>> {
    const { fees, base, quote, side, amount, omitExchanges } = await request.json()
    let errors: Record<string, any>[] = []
    let best
    if (base && quote && amount && side) {
        const supportedExchanges = [
            'btcmarkets',
            'independentreserve',
            'kraken',
            'luno',
            'coinspot',
            'coinjar',
            'bitaroo',
            'swyftx',
        ]
        const exchanges = supportedExchanges.filter((e) => !omitExchanges.includes(e))
        let promises: any[] = []
        exchanges.forEach((exchange) => {
            promises.push(exchangesMethods[exchange]?.(base, quote, side, amount, fees[exchange]))
        })

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
                    errors.push({ [exchange]: result.reason })
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

    return NextResponse.json({ best, errors })
}
