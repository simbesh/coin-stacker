import { HardblockTicker } from '@/types/types'
import { ExchangeHandler, MarketNotFoundError } from '../types'

export const getHardblockMockOrderBook: ExchangeHandler = async (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number
) => {
    if (base === 'BTC' && quote === 'AUD' && fee !== undefined && amount !== undefined) {
        const res = await fetch(`https://www.hardblock.com.au/sluh/ticker`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
        })

        const text = await res.text()
        if (text.includes('Down For Maintenance')) {
            return { error: 'Down for maintenance', bids: [], asks: [] } as any
        }

        try {
            const { status, buy, sell }: HardblockTicker = JSON.parse(text)
            if (status) {
                return side === 'buy'
                    ? { asks: [[buy, parseFloat(amount)]], bids: [] }
                    : { bids: [[sell, parseFloat(amount)]], asks: [] }
            }
        } catch (e) {
            throw e
        }
    } else if (base !== 'BTC' || quote !== 'AUD') {
        throw new MarketNotFoundError(`${base}/${quote}`, 'hardblock')
    }
}
