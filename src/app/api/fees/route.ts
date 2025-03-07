import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { supportedExchanges } from './utils'

// Set cache revalidation time to 1 hour for the aggregator
export const revalidate = 3600

async function fetchExchangeFee(exchange: string, currency: string): Promise<number> {
    try {
        // Use relative URL to avoid needing process.env
        const response = await fetch(`/api/fees/${exchange}?currency=${currency}`, { cache: 'no-store' })
        const data = await response.json()
        if (response.ok && data.fee !== undefined) {
            return data.fee
        }
        throw new Error(data.error || 'Failed to fetch fee')
    } catch (error) {
        console.error(`Error fetching ${exchange} fee:`, error)
        throw error
    }
}

export async function GET(request: Request): Promise<NextResponse<any>> {
    const url = new URL(request.url)
    const currency = url.searchParams.get('currency')
    const omitExchanges = url.searchParams.get('omitExchanges')?.split(',') || []
    
    if (!currency) {
        return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
    }
    
    const exchanges = supportedExchanges.filter(e => !omitExchanges.includes(e))
    const fees: Record<string, number> = {}
    const errors: Record<string, string> = {}
    
    const results = await Promise.allSettled(
        exchanges.map(exchange => fetchExchangeFee(exchange, currency))
    )
    
    results.forEach((result, i) => {
        const exchange = exchanges[i]
        if (exchange !== undefined) {
            if (result.status === 'fulfilled') {
                fees[exchange] = result.value
            } else {
                console.error(`Error fetching fees from ${exchange}:`, result.reason)
                errors[exchange] = result.reason.toString()
            }
        }
    })
    
    return NextResponse.json({ fees, errors })
} 