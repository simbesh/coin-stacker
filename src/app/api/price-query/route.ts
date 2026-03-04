import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { getBestOrders } from '@/lib/utils'
import { orderbookMethods, supportedExchanges } from './exchanges'
import { DEFAULT_REMOTE_DISABLED_REASON, getRemoteDisabledExchanges } from './exchanges/remote-config'

export async function POST(request: Request): Promise<NextResponse<any>> {
    const data = await request.json()
    const { fees = {}, base, quote, side, amount, omitExchanges = [] } = data
    const errors: Record<string, any>[] = []
    let best: unknown
    if (base && quote && amount && side) {
        const userOmittedExchanges = new Set(Array.isArray(omitExchanges) ? omitExchanges : [])
        const remoteDisabledExchanges = await getRemoteDisabledExchanges(supportedExchanges)
        const remoteDisabledExchangeIds = new Set(remoteDisabledExchanges.map(({ id }) => id))
        const exchanges = supportedExchanges.filter(
            (exchange) => !(userOmittedExchanges.has(exchange) || remoteDisabledExchangeIds.has(exchange)),
        )
        const promises = exchanges.map((exchange) =>
            orderbookMethods[exchange]?.(base, quote, side, amount, fees[exchange]),
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
            Number.parseFloat(amount),
            fees,
            base,
            quote,
            side,
            base,
        )
        best = sortedBests
        errors.push(...orderbookErrors)
        errors.push(
            ...remoteDisabledExchanges
                .filter(({ id }) => !userOmittedExchanges.has(id))
                .map(({ id, reason }) => ({
                    name: id,
                    error: {
                        name: reason ?? DEFAULT_REMOTE_DISABLED_REASON,
                    },
                })),
        )
    }

    return NextResponse.json({ best, errors })
}
