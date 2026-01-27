import { coinstashWithdrawFees } from '@/lib/constants/coinstash-withdraw-fees'
import { swyftxWithdrawFees } from '@/lib/constants/swyftx-withdraw-fees'
import coinspotFees from 'data/coinspot-fees.json'
import { binance, luno, okx } from 'ccxt'
import { NextRequest, NextResponse } from 'next/server'

// Cache for 24 hours (86400 seconds)
export const revalidate = 86400

// Mock withdrawal fees data - in production, this would come from an external API
const withdrawalFees: Record<string, Record<string, number>> = {
    bitaroo: {
        BTC: 0.00001,
    },
    hardblock: {
        BTC: 0.00000204,
    },
    coinspot: coinspotFees,
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const exchange = searchParams.get('exchange')
        const currency: string | null = searchParams.get('currency')

        if (!exchange) {
            return NextResponse.json({ error: 'Exchange parameter is required' }, { status: 400 })
        }

        let fees: Record<string, number> = {}

        // Handle exchanges with live API data
        if (exchange === 'btcmarkets') {
            fees = await getBTCMarketFee()
        } else if (exchange === 'independentreserve') {
            fees = await getIndependentReserveFee()
        } else if (exchange === 'okx') {
            fees = await getOKXFee()
        } else if (exchange === 'binance') {
            fees = await getBinanceFee()
        } else if (exchange === 'day1x') {
            fees = {
                override: 0,
            }
            // } else if (exchange === 'coinspot') {
            //     fees = await getCoinspotFee()
        } else if (exchange === 'luno') {
            if (!currency) {
                return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
            }
            fees = await getLunoFee({ currency })
        } else if (exchange === 'digitalsurge') {
            fees = await getDigitalSurgeFee()
        } else if (exchange === 'coinstash' && currency) {
            fees = getCoinstashFee(currency)
        } else if (exchange === 'swyftx' && currency) {
            fees = getSwyftxFee(currency)
            // } else if (exchange === 'wayex') {
            // fees = await getWayexFee()
        } else {
            // Get withdrawal fees for other exchanges, fallback to default if not found
            const exchangeFees = withdrawalFees[exchange as keyof typeof withdrawalFees] ?? {}
            fees = exchangeFees as Record<string, number>
        }

        return NextResponse.json(
            { fees, feeType: exchangeFeeType[exchange as keyof typeof exchangeFeeType] },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
                },
            }
        )
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

async function getIndependentReserveFee(): Promise<Record<string, number>> {
    try {
        const response = await fetch('https://api.independentreserve.com/Public/GetCryptoWithdrawalFees2', {
            next: { revalidate }, // Cache for 24 hours
        })

        if (!response.ok) {
            throw new Error(`Independent Reserve API error: ${response.status}`)
        }

        const data = await response.json()

        // Transform the array of objects into Record<string, number>
        const fees: Record<string, number> = {}

        data.forEach((item: { Currency: string; Fee: number }) => {
            fees[normalizeCoinSymbol(item.Currency)] = item.Fee
        })

        return fees
    } catch (error) {
        console.error('Error fetching Independent Reserve fees:', error)
        return {}
    }
}

// https://api.independentreserve.com/Public/GetCryptoWithdrawalFees2
// [
//     {
//       "Fee": 0.00001,
//       "Network": "Bitcoin",
//       "Currency": "Xbt"
//     },
//     {
//       "Fee": 2,
//       "Network": "Tron",
//       "Currency": "Usdt"
//     },
//     {
//       "Fee": 5,
//       "Network": "Ethereum",
//       "Currency": "Usdt"
//     }
//   ]

function normalizeCoinSymbol(coin: string) {
    if (coin.toLowerCase() === 'xbt') {
        return 'BTC'
    }
    return coin.toUpperCase()
}

async function getOKXFee(): Promise<Record<string, number>> {
    const exchange = new okx({
        apiKey: process.env.OKX_KEY,
        secret: process.env.OKX_SECRET,
        password: process.env.OKX_PASSWORD,
        timeout: 10000,
        hostname: 'us.okx.com',
    })
    await exchange.loadMarkets()

    const currencies = await exchange.fetchCurrencies()

    const fees: Record<string, number> = {}

    for (const coin of Object.keys(currencies)) {
        const currency = currencies[coin] as any
        if (currency?.networks) {
            const networks = currency.networks as Record<string, any>
            const network = networks[coin] || networks['ERC20'] || networks['SOL']
            if (network?.fee) {
                fees[coin] = network.fee
            }
        }
    }

    return fees
}

async function getBinanceFee(): Promise<Record<string, number>> {
    const exchange = new binance({
        apiKey: process.env.BINANCE_KEY,
        secret: process.env.BINANCE_SECRET,
        timeout: 10000,
    })
    await exchange.loadMarkets()

    const currencies = await exchange.fetchCurrencies()

    const fees: Record<string, number> = {}

    for (const coin of Object.keys(currencies)) {
        const currency = currencies[coin] as any
        if (currency?.networks) {
            const networks = currency.networks as Record<string, any>
            const network = networks[coin] || networks['ERC20'] || networks['BSC']
            if (network?.fee) {
                fees[coin] = network.fee
            }
        }
    }

    return fees
}

// use binance as proxy for coinspot
// async function getCoinspotFee(): Promise<Record<string, number>> {
//     const exchange = new binance({
//         apiKey: process.env.BINANCE_KEY,
//         secret: process.env.BINANCE_SECRET,
//     })
//     await exchange.loadProxyModules()
//     exchange.socksProxy = process.env.SOCKS_PROXY_URL!
//     await exchange.loadMarkets()
//     await exchange.fetchCurrencies()

//     const currencies = await exchange.fetchCurrencies()

//     const fees: Record<string, number> = {}

//     for (const [coin, info] of Object.entries(currencies)) {
//         fees[coin] = info.fee as number
//     }

//     return fees
// }

const dummyAddresses: Record<string, string> = {
    ETH: '0x0000000000000000000000000000000000000000',
    BTC: '3NqxbRaZyU9hv6wP7Wr5GPHyS5bhNZzFpw',
    XRP: 'r47bGjPxUWEdGmh9XhES4f2FUuDWEhxfbJ|||124',
    USDT: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
    SOL: '5aB7nyNJTuQZdKnhZXQHNhT16tBNevCuLRp14btvANxu',
    AVAX: '0x9206cf2AE2Be546392550aC6801Ac4a874B05C4c',
    default: '0x0000000000000000000000000000000000000000',
}

// The only exception to this is XRP, which has a fixed 0.03% send fee.
async function getLunoFee({ currency }: { currency: string }) {
    const amount = 1
    const address = dummyAddresses[currency] ?? dummyAddresses.default
    const exchange = new luno({
        apiKey: process.env.LUNO_KEY,
        secret: process.env.LUNO_SECRET,
    })
    await exchange.loadMarkets()
    const signed = exchange.sign('/api/1/send_fee', 'private', 'GET')
    const response = await fetch(
        `https://api.luno.com/api/1/send_fee?amount=${amount}&currency=${currency}&address=${address}`,
        { headers: signed.headers }
    )
    const data = await response.json()

    return { [currency]: Number(data.fee) }
}

async function getDigitalSurgeFee(): Promise<Record<string, number>> {
    const response = await fetch('https://digitalsurge.com.au/api/public/broker/assets/')
    const data = await response.json()

    const fees: Record<string, number> = {}
    for (const asset of data.results) {
        fees[asset.code] = Number(asset.withdrawal_fee)
    }

    return fees
}

function getCoinstashFee(currency: string): Record<string, number> {
    return { [currency]: coinstashWithdrawFees[currency as keyof typeof coinstashWithdrawFees] }
}

function getSwyftxFee(currency: string): Record<string, number> {
    const fee = swyftxWithdrawFees[currency as keyof typeof swyftxWithdrawFees]
    if (fee === undefined || fee === null) {
        return {}
    }
    return { [currency]: fee }
}

const exchangeFeeType = {
    binance: 'dynamic',
    btcmarkets: 'dynamic',
    independentreserve: 'dynamic',
    okx: 'dynamic',
    coinspot: 'dynamic',
    luno: 'dynamic',
    digitalsurge: 'dynamic',
    coinstash: 'static',
    swyftx: 'static',
    day1x: 'free',
    bitaroo: 'static',
    hardblock: 'static',
    // TODO: Update wayex fee type once API is integrated ('dynamic', 'static', or 'free')
    // wayex: 'dynamic',
}
