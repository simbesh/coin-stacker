import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

// Set cache revalidation time to 1 hour for CoinSpot
export const revalidate = 3600

export async function GET(request: Request): Promise<NextResponse<any>> {
    const url = new URL(request.url)
    const currency = url.searchParams.get('currency')
    
    if (!currency) {
        return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
    }
    
    try {
        const res = await fetch(`https://www.coinspot.com.au/pubapi/v2/fees/withdrawal`)
        const json = await res.json()
        
        if (json.status === 'ok' && json.fees) {
            const currencyLower = currency.toLowerCase()
            const fee = json.fees[currencyLower] || 0
            return NextResponse.json({ fee })
        } else {
            throw new Error('Failed to fetch CoinSpot withdrawal fees')
        }
    } catch (error: any) {
        console.error('Error fetching CoinSpot fees:', error)
        Sentry.captureException(error)
        return NextResponse.json({ error: error.toString() }, { status: 500 })
    }
} 