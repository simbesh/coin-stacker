import { getBestOrders } from '@/lib/utils'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { orderbookMethods, supportedExchanges } from './exchanges'

export async function POST(request: Request): Promise<NextResponse<any>> {
    const data = await request.json()
    const { fees, base, quote, side, amount, omitExchanges } = data
    const errors: Record<string, any>[] = []
    let best
    if (base && quote && amount && side) {
        const exchanges = supportedExchanges.filter((e) => !omitExchanges.includes(e))
        const promises = exchanges.map((exchange) =>
            orderbookMethods[exchange]?.(base, quote, side, amount, fees[exchange])
        )

        const orderbooks: Record<string, { value?: any; error?: any }> = {}
        const results = await Promise.allSettled(promises)
        results.forEach((result: PromiseSettledResult<any>, i) => {
            const exchange = exchanges[i]
            if (exchange !== undefined) {
                if (result.status === 'fulfilled') {
                    if (result.value && typeof result.value === 'object' && 'error' in result.value) {
                        // Handle maintenance or other error responses that don't throw
                        errors.push({ name: exchange, error: result.value.error })
                        orderbooks[exchange] = {
                            error: result.value.error,
                        }
                    } else {
                        orderbooks[exchange] = {
                            value: result.value,
                        }
                    }
                } else {
                    console.error(`Error from ${exchange}:`, result.reason.toString())
                    if (!result.reason?.sentryIgnore) {
                        Sentry.captureException(result.reason, data)
                    }
                    errors.push({ name: exchange, error: result.reason.toString() })
                    orderbooks[exchange] = {
                        error: result.reason,
                    }
                }
            }
        })

        const { sortedBests, orderbookErrors } = getBestOrders(
            orderbooks,
            parseFloat(amount),
            fees,
            base,
            quote,
            side,
            base
        )
        best = sortedBests
        errors.push(...orderbookErrors)
    }

    return NextResponse.json({ best, errors })
}
