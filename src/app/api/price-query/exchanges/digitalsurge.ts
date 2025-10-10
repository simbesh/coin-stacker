import { ExchangeHandler } from '../types'

export const getDigitalSurgeMockOrderBook: ExchangeHandler = async (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number
) => {
    if (fee !== undefined && amount !== undefined && side && quote === 'AUD') {
        const assetsRes = await fetch(`https://digitalsurge.com.au/api/public/broker/assets/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
        })
        const assets = await assetsRes.json()
        const max_order_size_value = assets.results.find((x: any) => x.code === base)?.max_order_size_value
        if (max_order_size_value) {
            const res = await fetch(`https://digitalsurge.com.au/api/public/broker/ticker/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                },
            })
            const tickerData: Record<string, any> = await res.json()
            const price = tickerData[base]?.[side]
            if (price) {
                const key = side === 'buy' ? 'asks' : 'bids'
                if (amount && price * Number(amount) < Number(max_order_size_value)) {
                    return {
                        [key]: [[price, Number(amount)]],
                        [key === 'asks' ? 'bids' : 'asks']: [],
                    } as any
                }
            }
        }
    }
}
