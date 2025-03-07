import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { CurrencyNotFoundError } from '../utils'

// Set cache revalidation time to 1 hour for Day1x
export const revalidate = 3600

export async function GET(request: Request): Promise<NextResponse<any>> {
    const url = new URL(request.url)
    const currency = url.searchParams.get('currency')
    
    if (!currency) {
        return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
    }
    
    try {
        const res = await fetch(`https://exchange-api.day1x.io/api/v1/public/currencies`)
        const json = await res.json()
        
        if (json.data) {
            const currencyData = json.data.find((c: any) => c.currency === currency)
            if (currencyData && currencyData.withdrawFee !== undefined) {
                const fee = parseFloat(currencyData.withdrawFee)
                return NextResponse.json({ fee })
            }
        }
        throw new CurrencyNotFoundError(currency, 'day1x')
    } catch (error: any) {
        console.error('Error fetching Day1x fees:', error)
        if (!error?.sentryIgnore) {
            Sentry.captureException(error)
        }
        return NextResponse.json({ error: error.toString() }, { status: 500 })
    }
} 