import { SwOrdersResponse } from '@/types/types'
import { ExchangeHandler } from '../../types'
import { getCachedSwyftxKey, refreshSwyftxToken, updateCachedSwyftxKey } from './helpers'
import { differenceInDays } from 'date-fns'

export const getSwyftxMockOrderBook: ExchangeHandler = async (
    base: string,
    quote: string,
    side?: string,
    amount?: string,
    fee?: number
) => {
    if (fee !== undefined) {
        let token
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
                const res = await fetch(`https://api.swyftx.com.au/orders/rate/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
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
                    orderbook.asks = [[parseFloat(json.price), parseFloat(json.amount)]]
                } else {
                    orderbook.bids = [
                        [(parseFloat(json.amount) / parseFloat(json.total)) * (1 + fee), parseFloat(json.total)],
                    ]
                }
                return orderbook
            } catch (e) {
                console.error('e', e)
            }
        }
    }
}
