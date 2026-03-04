import type { CointreeQuotes } from '@/types/types'
import type { ExchangeHandler, OrderBookLevel } from '../types'

const cointreeOrderLimit: Record<string, number> = {
    AUD: 52_500,
    USDT: 35_000,
    USDC: 35_000,
}

export const getCointreeMockOrderBook: ExchangeHandler = async (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number,
) => {
    const liquidityLimit = cointreeOrderLimit[quote]
    if (fee !== undefined && amount !== undefined && liquidityLimit !== undefined) {
        const res = await fetch(`https://trade.cointree.com/api/prices/${base}/${quote}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
        })

        const json: CointreeQuotes = await res.json()
        let price: number
        if (quote === 'AUD') {
            price = side === 'buy' ? json.ask : json.bid
        } else {
            price = side === 'sell' ? 1 / json.ask : 1 / json.bid
        }
        if (amount && price * Number(amount) < liquidityLimit) {
            const orderLevel: OrderBookLevel = [price, Number(amount)]
            const asks = side === 'buy' ? [orderLevel] : []
            const bids = side === 'buy' ? [] : [orderLevel]

            return {
                asks,
                bids,
            }
        }
    }
}
