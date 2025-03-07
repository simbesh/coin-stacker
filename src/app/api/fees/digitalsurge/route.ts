import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { CurrencyNotFoundError } from '../utils'

// Set cache revalidation time to 1 hour for Digital Surge
export const revalidate = 3600

export async function GET(request: Request): Promise<NextResponse<any>> {
    const url = new URL(request.url)
    const currency = url.searchParams.get('currency')
    
    if (!currency) {
        return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
    }
    
    try {
        const res = await fetch(`https://digitalsurge.com.au/api/public/broker/assets/`)
        const json = await res.json()
        
        if (json.results) {
            const asset = json.results.find((x: any) => x.code === currency)
            if (asset && asset.withdrawal_fee !== undefined) {
                const fee = parseFloat(asset.withdrawal_fee)
                return NextResponse.json({ fee })
            }
        }
        throw new CurrencyNotFoundError(currency, 'digitalsurge')
    } catch (error: any) {
        console.error('Error fetching Digital Surge fees:', error)
        if (!error?.sentryIgnore) {
            Sentry.captureException(error)
        }
        return NextResponse.json({ error: error.toString() }, { status: 500 })
    }
} 