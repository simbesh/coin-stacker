import * as Sentry from '@sentry/nextjs'
import { luno } from 'ccxt'
import { NextResponse } from 'next/server'
import { getWithdrawalFees } from '../utils'

// Set cache revalidation time to 1 hour for Luno
export const revalidate = 3600

export async function GET(request: Request): Promise<NextResponse<any>> {
    const url = new URL(request.url)
    const currency = url.searchParams.get('currency')
    
    if (!currency) {
        return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
    }
    
    try {
        const exchange = new luno()
        const fee = await getWithdrawalFees(exchange, currency)
        return NextResponse.json({ fee })
    } catch (error: any) {
        console.error('Error fetching Luno fees:', error)
        if (!error?.sentryIgnore) {
            Sentry.captureException(error)
        }
        return NextResponse.json({ error: error.toString() }, { status: 500 })
    }
} 