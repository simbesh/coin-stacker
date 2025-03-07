import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { NotImplementedError } from '../utils'

// Set cache revalidation time to 1 hour for Cointree
export const revalidate = 3600

export async function GET(request: Request): Promise<NextResponse<any>> {
    const url = new URL(request.url)
    const currency = url.searchParams.get('currency')
    
    if (!currency) {
        return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
    }
    
    try {
        throw new NotImplementedError('cointree')
    } catch (error: any) {
        console.error('Error fetching Cointree fees:', error)
        if (!error?.sentryIgnore) {
            Sentry.captureException(error)
        }
        return NextResponse.json({ error: error.toString() }, { status: 501 })
    }
} 