import { CoinstashQuotes } from '@/types/types'
import { ExchangeHandler } from '../types'

export const getCoinstashMockOrderBook: ExchangeHandler = async (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number
) => {
    if (fee !== undefined && amount !== undefined) {
        const res = await fetch(`https://api.coinstash.com.au/oracle/v1/quotes/last/${quote}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
        })

        const json: CoinstashQuotes = await res.json()
        const baseLowerCase = base.toLowerCase()
        if (json.prices?.[baseLowerCase] !== undefined) {
            if (side === 'buy') {
                return {
                    asks: [[json.prices[baseLowerCase]!.buyPrice, parseFloat(amount)]],
                    bids: [],
                }
            } else {
                return {
                    bids: [[json.prices[baseLowerCase]!.sellPrice, parseFloat(amount)]],
                    asks: [],
                }
            }
        }
    }
}
