import * as Sentry from '@sentry/nextjs'
import { btcmarkets, Exchange, independentreserve, kraken, luno, okx } from 'ccxt'
import { NextResponse } from 'next/server'

// Define interfaces for fee responses
interface FeeResponse {
    currency: string
    fee: number
}

interface ExchangeFees {
    [currency: string]: number
}

// Error classes
class CurrencyNotFoundError extends Error {
    sentryIgnore = true

    constructor(currency: string, exchangeId: string) {
        super(`Currency ${currency} not found in ${exchangeId}`)
        this.name = 'CurrencyNotFoundError'
    }
}

class NotImplementedError extends Error {
    sentryIgnore = true

    constructor(exchangeId: string) {
        super(`Fee fetching for ${exchangeId} not implemented`)
        this.name = 'NotImplementedError'
    }
}

// Helper function for CCXT exchanges
const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args)

const getWithdrawalFees = async (exchange: Exchange, currency: string): Promise<number> => {
    exchange.fetchImplementation = fetcher
    await exchange.loadMarkets()
    
    if (currency in exchange.currencies) {
        const fees = await exchange.fetchWithdrawalFees([currency])
        return fees[currency] || 0
    } else {
        console.error(`Currency ${currency} not found in ${exchange.id}`)
        throw new CurrencyNotFoundError(currency, exchange.id)
    }
}

// Exchange-specific fee fetching methods
const getBTCMarketsFees = async (currency: string): Promise<number> => {
    const exchange = new btcmarkets()
    return getWithdrawalFees(exchange, currency)
}

const getIndependentReserveFees = async (currency: string): Promise<number> => {
    const exchange = new independentreserve()
    return getWithdrawalFees(exchange, currency)
}

const getKrakenFees = async (currency: string): Promise<number> => {
    const exchange = new kraken()
    return getWithdrawalFees(exchange, currency)
}

const getLunoFees = async (currency: string): Promise<number> => {
    const exchange = new luno()
    return getWithdrawalFees(exchange, currency)
}

const getOkxFees = async (currency: string): Promise<number> => {
    const exchange = new okx()
    return getWithdrawalFees(exchange, currency)
}

const getCoinSpotFees = async (currency: string): Promise<number> => {
    try {
        const res = await fetch(`https://www.coinspot.com.au/pubapi/v2/fees/withdrawal`)
        const json = await res.json()
        
        if (json.status === 'ok' && json.fees) {
            const currencyLower = currency.toLowerCase()
            return json.fees[currencyLower] || 0
        } else {
            throw new Error('Failed to fetch CoinSpot withdrawal fees')
        }
    } catch (error) {
        console.error('Error fetching CoinSpot fees:', error)
        throw error
    }
}

const getCoinJarFees = async (currency: string): Promise<number> => {
    try {
        const res = await fetch(`https://api.coinjar.com/v3/exchange_rates`)
        const json = await res.json()
        
        // CoinJar doesn't have a public API for withdrawal fees
        // This is a placeholder - you would need to implement a proper solution
        throw new NotImplementedError('coinjar')
    } catch (error) {
        console.error('Error fetching CoinJar fees:', error)
        throw error
    }
}

const getBitarooFees = async (currency: string): Promise<number> => {
    if (currency !== 'BTC') {
        throw new CurrencyNotFoundError(currency, 'bitaroo')
    }
    
    try {
        // Bitaroo only supports BTC
        const res = await fetch(`https://api.bitaroo.com.au/v1/account/fee-schedule`)
        const json = await res.json()
        
        if (json.success && json.data && json.data.withdrawal) {
            return json.data.withdrawal.btc || 0
        } else {
            throw new Error('Failed to fetch Bitaroo withdrawal fees')
        }
    } catch (error) {
        console.error('Error fetching Bitaroo fees:', error)
        throw error
    }
}

const getSwyftxFees = async (currency: string): Promise<number> => {
    // Swyftx doesn't have a public API for withdrawal fees
    // This would need to use the authenticated API similar to your order book implementation
    throw new NotImplementedError('swyftx')
}

const getCoinstashFees = async (currency: string): Promise<number> => {
    // Coinstash doesn't have a public API for withdrawal fees
    throw new NotImplementedError('coinstash')
}

const getCointreeFees = async (currency: string): Promise<number> => {
    // Cointree doesn't have a public API for withdrawal fees
    throw new NotImplementedError('cointree')
}

const getDigitalSurgeFees = async (currency: string): Promise<number> => {
    try {
        const res = await fetch(`https://digitalsurge.com.au/api/public/broker/assets/`)
        const json = await res.json()
        
        if (json.results) {
            const asset = json.results.find((x: any) => x.code === currency)
            if (asset && asset.withdrawal_fee !== undefined) {
                return parseFloat(asset.withdrawal_fee)
            }
        }
        throw new CurrencyNotFoundError(currency, 'digitalsurge')
    } catch (error) {
        console.error('Error fetching Digital Surge fees:', error)
        throw error
    }
}

const getHardblockFees = async (currency: string): Promise<number> => {
    // Hardblock doesn't have a public API for withdrawal fees
    throw new NotImplementedError('hardblock')
}

const getDay1xFees = async (currency: string): Promise<number> => {
    try {
        const res = await fetch(`https://exchange-api.day1x.io/api/v1/public/currencies`)
        const json = await res.json()
        
        if (json.data) {
            const currencyData = json.data.find((c: any) => c.currency === currency)
            if (currencyData && currencyData.withdrawFee !== undefined) {
                return parseFloat(currencyData.withdrawFee)
            }
        }
        throw new CurrencyNotFoundError(currency, 'day1x')
    } catch (error) {
        console.error('Error fetching Day1x fees:', error)
        throw error
    }
}

// Map of exchange IDs to their fee fetching methods
const feeMethods: Record<string, (currency: string) => Promise<number>> = {
    btcmarkets: getBTCMarketsFees,
    independentreserve: getIndependentReserveFees,
    kraken: getKrakenFees,
    luno: getLunoFees,
    coinspot: getCoinSpotFees,
    coinjar: getCoinJarFees,
    bitaroo: getBitarooFees,
    swyftx: getSwyftxFees,
    coinstash: getCoinstashFees,
    cointree: getCointreeFees,
    digitalsurge: getDigitalSurgeFees,
    okx: getOkxFees,
    hardblock: getHardblockFees,
    day1x: getDay1xFees,
}

// List of supported exchanges (matching the ones in route.ts)
const supportedExchanges = [
    'btcmarkets',
    'independentreserve',
    'kraken',
    'luno',
    'coinspot',
    'coinjar',
    'bitaroo',
    'swyftx',
    'coinstash',
    'cointree',
    'digitalsurge',
    'okx',
    'hardblock',
    'day1x',
]

// Main function to fetch fees from all exchanges
export async function fetchAllWithdrawalFees(currency: string, omitExchanges: string[] = []): Promise<{
    fees: Record<string, number>,
    errors: Record<string, string>
}> {
    const exchanges = supportedExchanges.filter(e => !omitExchanges.includes(e))
    const promises = exchanges.map(exchange => feeMethods[exchange]?.(currency))
    
    const fees: Record<string, number> = {}
    const errors: Record<string, string> = {}
    
    const results = await Promise.allSettled(promises)
    
    results.forEach((result, i) => {
        const exchange = exchanges[i]
        if (exchange !== undefined) {
            if (result.status === 'fulfilled') {
                fees[exchange] = result.value
            } else {
                console.error(`Error fetching fees from ${exchange}:`, result.reason.toString())
                if (!result.reason?.sentryIgnore) {
                    Sentry.captureException(result.reason)
                }
                errors[exchange] = result.reason.toString()
            }
        }
    })
    
    return { fees, errors }
}

// API endpoint handler
export async function GET(request: Request): Promise<NextResponse<any>> {
    const url = new URL(request.url)
    const currency = url.searchParams.get('currency')
    const omitExchanges = url.searchParams.get('omitExchanges')?.split(',') || []
    
    if (!currency) {
        return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
    }
    
    try {
        const { fees, errors } = await fetchAllWithdrawalFees(currency, omitExchanges)
        return NextResponse.json({ fees, errors })
    } catch (error) {
        console.error('Error fetching withdrawal fees:', error)
        Sentry.captureException(error)
        return NextResponse.json({ error: 'Failed to fetch withdrawal fees' }, { status: 500 })
    }
}
