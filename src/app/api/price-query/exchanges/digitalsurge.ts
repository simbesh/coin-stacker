import type { ExchangeHandler, OrderBook, OrderBookLevel } from '../types'

interface DigitalSurgeAsset {
    code: string
    max_order_size_value?: number | string
}

interface DigitalSurgeAssetsResponse {
    results: DigitalSurgeAsset[]
}

type DigitalSurgeSide = 'buy' | 'sell'
type DigitalSurgeTickerResponse = Record<string, Partial<Record<DigitalSurgeSide, number>>>

export const getDigitalSurgeMockOrderBook: ExchangeHandler = async (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number,
) => {
    if (fee === undefined || amount === undefined || !isDigitalSurgeSide(side) || quote !== 'AUD') {
        return
    }

    const maxOrderSize = await getMaxOrderSize(base)
    if (maxOrderSize === undefined) {
        return
    }

    const price = await getTickerPrice(base, side)
    if (price === undefined) {
        return
    }

    const requestedAmount = Number(amount)
    if (price * requestedAmount >= maxOrderSize) {
        return
    }

    const level: OrderBookLevel = [price, requestedAmount]
    const orderbook: OrderBook =
        side === 'buy'
            ? {
                  asks: [level],
                  bids: [],
              }
            : {
                  asks: [],
                  bids: [level],
              }

    return orderbook
}

async function getMaxOrderSize(base: string): Promise<number | undefined> {
    const assetsRes = await fetch('https://digitalsurge.com.au/api/public/broker/assets/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
    })
    const assets: DigitalSurgeAssetsResponse = await assetsRes.json()
    const value = assets.results.find((asset) => asset.code === base)?.max_order_size_value
    if (value === undefined) {
        return undefined
    }
    return Number(value)
}

async function getTickerPrice(base: string, side: DigitalSurgeSide): Promise<number | undefined> {
    const response = await fetch('https://digitalsurge.com.au/api/public/broker/ticker/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
    })
    const tickerData: DigitalSurgeTickerResponse = await response.json()
    return tickerData[base]?.[side]
}

function isDigitalSurgeSide(side: string | undefined): side is DigitalSurgeSide {
    return side === 'buy' || side === 'sell'
}
