import { differenceInDays } from 'date-fns'
import type { SwOrdersResponse } from '@/types/types'
import type { ExchangeHandler } from '../../types'
import { getCachedSwyftxKey, refreshSwyftxToken, updateCachedSwyftxKey } from './helpers'

export const getSwyftxMockOrderBook: ExchangeHandler = async (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number,
) => {
    if (fee !== undefined) {
        let token: string | undefined
        const cached = await getCachedSwyftxKey()
        if (cached && differenceInDays(new Date(), cached.updated_at) >= 7) {
            const accessToken = await refreshSwyftxToken()
            if (accessToken) {
                await updateCachedSwyftxKey(accessToken)
                token = accessToken
            }
        } else {
            token = cached?.refresh_key
        }

        if (token) {
            try {
                const res = await fetch('https://api.swyftx.com.au/orders/rate/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
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
                const orderbook = {
                    asks: [] as [number, number][],
                    bids: [] as [number, number][],
                }
                if (side === 'buy') {
                    orderbook.asks = [[Number.parseFloat(json.price), Number.parseFloat(json.amount)]]
                } else {
                    orderbook.bids = [
                        [
                            (Number.parseFloat(json.amount) / Number.parseFloat(json.total)) * (1 + fee),
                            Number.parseFloat(json.total),
                        ],
                    ]
                }
                return orderbook
            } catch (e) {
                console.error('e', e)
            }
        }
    }
}
