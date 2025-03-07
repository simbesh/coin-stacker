import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { CurrencyNotFoundError } from '../utils'

// Set cache revalidation time to 1 hour for Bitaroo
export const revalidate = 3600

export async function GET(request: Request): Promise<NextResponse<any>> {
    const url = new URL(request.url)
    const currency = url.searchParams.get('currency')
    
    if (!currency) {
        return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
    }
    
    if (currency !== 'BTC') {
        throw new CurrencyNotFoundError(currency, 'bitaroo')
    }
    
    try {
        const res = await fetch(`https://api.bitaroo.com.au/v1/account/fee-schedule`)
        const json = await res.json()
        
        if (json.success && json.data && json.data.withdrawal) {
            const fee = json.data.withdrawal.btc || 0
            return NextResponse.json({ fee })
        } else {
            throw new Error('Failed to fetch Bitaroo withdrawal fees')
        }
    } catch (error: any) {
        console.error('Error fetching Bitaroo fees:', error)
        if (!error?.sentryIgnore) {
            Sentry.captureException(error)
        }
        return NextResponse.json({ error: error.toString() }, { status: 500 })
    }
} 