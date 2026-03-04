import { captureException } from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { getBestOrders } from '@/lib/utils'
import { orderbookMethods, supportedExchanges } from './exchanges'
import { DEFAULT_REMOTE_DISABLED_REASON, getRemoteDisabledExchanges } from './exchanges/remote-config'
import type { ExchangeResult } from './types'

interface PriceQueryRequestBody {
    amount?: number | string
    base?: string
    fees?: Record<string, number>
    omitExchanges?: string[]
    quote?: string
    side?: string
}

interface PriceQueryError {
    error: unknown
    name: string
}

interface PriceQueryResponse {
    best: ReturnType<typeof getBestOrders>['sortedBests'] | undefined
    errors: PriceQueryError[]
}

export async function POST(request: Request): Promise<NextResponse<PriceQueryResponse>> {
    const data: PriceQueryRequestBody = await request.json()
    const { fees = {}, base, quote, side, amount, omitExchanges = [] } = data
    const errors: PriceQueryError[] = []
    let best: ReturnType<typeof getBestOrders>['sortedBests']
    if (base && quote && amount !== undefined && (side === 'buy' || side === 'sell')) {
        const userOmittedExchanges = new Set(Array.isArray(omitExchanges) ? omitExchanges : [])
        const remoteDisabledExchanges = await getRemoteDisabledExchanges(supportedExchanges)
        const remoteDisabledExchangeIds = new Set(remoteDisabledExchanges.map(({ id }) => id))
        const exchanges = supportedExchanges.filter(
            (exchange) => !(userOmittedExchanges.has(exchange) || remoteDisabledExchangeIds.has(exchange)),
        )
        const promises = exchanges.map((exchange) =>
            orderbookMethods[exchange]?.(base, quote, side, amount, fees[exchange]),
        )

        const orderbooks: Record<string, { value?: ExchangeResult; error?: unknown }> = {}
        const results = await Promise.allSettled(promises)
        for (const [i, result] of results.entries()) {
            const exchange = exchanges[i]
            if (exchange !== undefined) {
                if (result.status === 'fulfilled') {
                    if (isExchangeError(result.value)) {
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
                        captureException(result.reason)
                    }
                    errors.push({ name: exchange, error: result.reason.toString() })
                    orderbooks[exchange] = {
                        error: result.reason,
                    }
                }
            }
        }

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

function isExchangeError(value: ExchangeResult | undefined): value is { error: string } {
    return typeof value === 'object' && value !== null && 'error' in value && typeof value.error === 'string'
}
