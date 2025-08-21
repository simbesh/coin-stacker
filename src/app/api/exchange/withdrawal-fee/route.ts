import { NextRequest, NextResponse } from 'next/server'

// Cache for 24 hours (86400 seconds)
export const revalidate = 86401

// Mock withdrawal fees data - in production, this would come from an external API
const withdrawalFees: Record<string, Record<string, number>> = {
    coinstash: {
        BTC: 0.0005,
        ETH: 0.01,
        USDT: 10,
        BCH: 0.001,
        LTC: 0.01,
        ADA: 1,
        XRP: 0.5,
        DOGE: 5,
        MATIC: 10,
    },
    independentreserve: {
        BTC: 0.0001,
        ETH: 0.005,
        USDT: 5,
        BCH: 0.0005,
        LTC: 0.001,
        ADA: 0.5,
        XRP: 0.25,
        DOGE: 2,
        MATIC: 5,
    },
    coinjar: {
        BTC: 0.0003,
        ETH: 0.007,
        USDT: 7,
        BCH: 0.0007,
        LTC: 0.007,
        ADA: 0.7,
        XRP: 0.35,
        DOGE: 3.5,
        MATIC: 7,
    },
    luno: {
        BTC: 0.0004,
        ETH: 0.009,
        USDT: 9,
        BCH: 0.0009,
        LTC: 0.009,
        ADA: 0.9,
        XRP: 0.45,
        DOGE: 4.5,
        MATIC: 9,
    },
    swyftx: {
        BTC: 0.00015,
        ETH: 0.006,
        USDT: 6,
        BCH: 0.0006,
        LTC: 0.006,
        ADA: 0.6,
        XRP: 0.3,
        DOGE: 3,
        MATIC: 6,
    },
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const exchange = searchParams.get('exchange')

        if (!exchange) {
            return NextResponse.json({ error: 'Exchange parameter is required' }, { status: 400 })
        }

        let fees: Record<string, number>

        // Handle btcmarkets with live API data
        if (exchange.toLowerCase() === 'btcmarkets') {
            fees = await getBTCMarketFee()
        } else {
            // Get withdrawal fees for other exchanges, fallback to default if not found
            const exchangeFees = withdrawalFees[exchange.toLowerCase() as keyof typeof withdrawalFees]
            fees = (exchangeFees as Record<string, number>) ?? withdrawalFees.default
        }

        return NextResponse.json(fees, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
            },
        })
    } catch (error) {
        console.error('Error fetching withdrawal fees:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function getBTCMarketFee(): Promise<Record<string, number>> {
    try {
        const response = await fetch('https://api.btcmarkets.net/v3/withdrawal-fees', {
            next: { revalidate }, // Cache for 24 hours
        })

        if (!response.ok) {
            throw new Error(`BTCMarkets API error: ${response.status}`)
        }

        const data = await response.json()

        // Transform the array of objects into Record<string, number>
        const fees: Record<string, number> = {}

        data.forEach((item: { assetName: string; fee: string }) => {
            fees[item.assetName] = parseFloat(item.fee)
        })

        return fees
    } catch (error) {
        console.error('Error fetching BTCMarkets fees:', error)
        return {}
    }
}
