import { type ClassValue, clsx } from 'clsx'
import { round } from 'lodash'
import { twMerge } from 'tailwind-merge'
import type { BrOrderBookResponse, CjOrderBookResponse, CsOrderBookResponseOk } from '@/types/types'

export const OLD_KRAKEN_TAKER_FEE = 0.0026

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const stableCoins = ['USDT', 'USDC']
const stableBaseFeeOverride: Record<string, number> = {
    coinjar: 0.000_01,
    kraken: 0.002,
}
const stableQuoteFeeOverride: Record<string, number> = {
    coinjar: 0.0006,
}

const formattedExchangeNames: Record<string, string> = {
    binance: 'Binance',
    btcmarkets: 'BTCMarkets',
    independentreserve: 'Independent Reserve',
    kraken: 'Kraken',
    luno: 'Luno',
    coinspot: 'CoinSpot',
    coinjar: 'CoinJar',
    bitaroo: 'Bitaroo',
    swyftx: 'Swyftx',
    coinstash: 'Coinstash',
    cointree: 'Cointree',
    digitalsurge: 'DigitalSurge',
    okx: 'OKX',
    hardblock: 'HardBlock',
    pepperstonecrypto: 'Pepperstone Crypto',
    wayex: 'Wayex',
    // elbaite: 'Elbaite',
}

export const exchangeTypes: Record<string, 'orderbook' | 'broker'> = {
    binance: 'orderbook',
    btcmarkets: 'orderbook',
    independentreserve: 'orderbook',
    kraken: 'orderbook',
    luno: 'orderbook',
    coinspot: 'orderbook',
    coinjar: 'orderbook',
    bitaroo: 'orderbook',
    swyftx: 'broker',
    coinstash: 'broker',
    cointree: 'broker',
    digitalsurge: 'broker',
    okx: 'orderbook',
    hardblock: 'broker',
    pepperstonecrypto: 'orderbook',
    wayex: 'orderbook',
}

export const defaultExchangeFees: Record<string, number> = {
    binance: 0.001,
    btcmarkets: 0.0085,
    independentreserve: 0.005,
    kraken: 0.004,
    luno: 0.001,
    coinspot: 0.001,
    coinjar: 0.001,
    bitaroo: 0.0019,
    swyftx: 0.006,
    coinstash: 0.006,
    cointree: 0.0075,
    digitalsurge: 0.005,
    okx: 0.007,
    hardblock: 0,
    wayex: 0.004,
    pepperstonecrypto: 0.001,
    // elbaite: 0.011,
}

export const overrideDefaultExchangeFees: Record<string, { old: number; new: number }> = {
    okx: {
        old: 0.005,
        new: defaultExchangeFees.okx ?? 0.007,
    },
    coinstash: {
        old: 0.0085,
        new: defaultExchangeFees.coinstash ?? 0.006,
    },
}

export const defaultEnabledExchanges: Record<string, boolean> = {
    binance: true,
    btcmarkets: true,
    independentreserve: true,
    kraken: true,
    luno: true,
    coinspot: true,
    coinjar: true,
    bitaroo: true,
    swyftx: true,
    coinstash: true,
    cointree: true,
    digitalsurge: true,
    okx: true,
    hardblock: true,
    wayex: true,
    pepperstonecrypto: true,
    // elbaite: true,
}

export function currencyFormat(num: number | undefined, currencyCode = 'AUD', digits = 2): string {
    if (num === undefined) {
        return ''
    }
    const options = {
        style: 'currency' as const,
        currency: currencyCode,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }
    return new Intl.NumberFormat('en-AU', options).format(num)
}

function parseOrderBookStringTuple(tuple: [string, string]): [number, number] {
    return [Number.parseFloat(tuple[0]), Number.parseFloat(tuple[1])]
}

interface ParsedOrderBook {
    asks: [number, number][]
    bids: [number, number][]
    datetime?: string
    nonce?: number
    timestamp?: number
}

interface ParsedOrderBookError {
    error: string
}

type OrderBookEntry = ParsedOrderBook | ParsedOrderBookError

export function parseBrOrderBook(data: BrOrderBookResponse): ParsedOrderBook {
    return {
        bids: data.buy.map(({ price, amount }) => parseOrderBookStringTuple([price, amount])) as [number, number][],
        asks: data.sell.map(({ price, amount }) => parseOrderBookStringTuple([price, amount])) as [number, number][],
    }
}

export function parseCjOrderBook(data: CjOrderBookResponse): OrderBookEntry {
    // Check if this is an error response
    if ('error_type' in data) {
        return {
            error: data.error_messages.join(', '),
        }
    }

    const timestamp = Date.now()
    return {
        bids: data.bids.map(parseOrderBookStringTuple),
        asks: data.asks.map(parseOrderBookStringTuple),
        timestamp,
        datetime: new Date(timestamp).toISOString(),
        nonce: timestamp,
    }
}

export function parseCsOrderBook(data: CsOrderBookResponseOk): ParsedOrderBook {
    const bids: [number, number][] = data.buyorders.map(({ rate, amount }) => [rate, amount])
    const asks: [number, number][] = data.sellorders.map(({ rate, amount }) => [rate, amount])
    const timestamp = Date.now()

    let bidLevel: [number, number] | undefined
    let askLevel: [number, number] | undefined
    // remove orders assumed to be matched ie: bid[0] > ask[0]
    if (bids[0] && asks[0] && bids[0][0] >= asks[0][0]) {
        for (let i = 0; i < bids.length; i++) {
            for (let j = 0; j < asks.length; j++) {
                bidLevel = bids[i]
                askLevel = asks[j]
                if (bidLevel && askLevel && bidLevel[0] >= askLevel[0]) {
                    if (bidLevel[1] >= askLevel[1]) {
                        bidLevel[1] -= askLevel[1]
                        asks.shift()
                        j--
                    } else if (bidLevel[1] === askLevel[1]) {
                        asks.shift()
                        bids.shift()
                        j--
                        i--
                    } else {
                        askLevel[1] -= bidLevel[1]
                        bids.shift()
                        i--
                        break
                    }
                }
            }
        }
    }

    return {
        bids,
        asks,
        timestamp,
        datetime: new Date(timestamp).toISOString(),
        nonce: timestamp,
    }
}

interface Best {
    exchange: string
    feeRate: number
    fees: number
    grossAveragePrice: number
    grossPrice: number
    netCost: number
    netPrice: number
}

export function getBestOrders(
    orderbooks: Record<string, { error?: unknown; value?: OrderBookEntry }>,
    amount: number,
    exchangeFees: Record<string, number>,
    base: string,
    quote: string,
    side: 'buy' | 'sell',
    currency: string,
): { sortedBests: Best[]; orderbookErrors: { name: string; error: { name: string } }[] } {
    let sortedBests: Best[] = []
    const errors: { error: { name: string }; name: string }[] = []
    for (const [exchange, orderbook] of Object.entries(orderbooks)) {
        if (orderbook.error) {
            continue
        }
        if (
            orderbook.value === undefined ||
            'error' in orderbook.value ||
            orderbook.value[side === 'buy' ? 'asks' : 'bids']?.flat().includes(Number.NaN)
        ) {
            let errorName = 'could not get price'
            if (orderbook.error instanceof Error) {
                errorName = orderbook.error.message
            } else if (typeof orderbook.error === 'string') {
                errorName = orderbook.error
            }

            errors.push({
                name: exchange,
                error: { name: errorName },
            })
            continue
        }

        let grossCost = 0
        let grossPrice = side === 'buy' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
        let volume = 0
        let amountLeft = amount
        let sumVolume = 0

        const orders = side === 'buy' ? orderbook.value.asks : orderbook.value.bids
        for (const order of orders || []) {
            grossPrice = order[0]
            volume = order[1]
            sumVolume += volume
            if (volume >= amountLeft) {
                grossCost += grossPrice * amountLeft
                break
            }
            amountLeft -= volume
            grossCost += grossPrice * volume
        }

        let feeRate = exchangeFees[exchange] ?? 0
        if (stableCoins.includes(base)) {
            feeRate = stableBaseFeeOverride[exchange] ?? feeRate
        }
        if (stableCoins.includes(quote)) {
            feeRate = stableQuoteFeeOverride[exchange] ?? feeRate
        }

        const fees = grossCost * feeRate
        const netCost = side === 'buy' ? grossCost + fees : grossCost - fees
        const netPrice = side === 'buy' ? grossPrice * (1 + feeRate) : grossPrice * (1 - feeRate)

        const priceCheck =
            side === 'buy' ? grossPrice > Number.NEGATIVE_INFINITY : grossPrice < Number.POSITIVE_INFINITY
        if (priceCheck && volume >= amountLeft) {
            sortedBests.push({
                exchange,
                netCost,
                grossPrice,
                netPrice,
                grossAveragePrice: grossCost / amount,
                fees,
                feeRate,
            })
        } else {
            errors.push({
                name: exchange,
                error: { name: `Insufficient liquidity: ${round(sumVolume, 8)} ${currency} available` },
            })
        }
    }

    sortedBests = sortedBests.sort((a, b) => {
        const sortMultiplier = side === 'buy' ? 1 : -1
        if (a.netCost < b.netCost) {
            return -sortMultiplier
        }
        if (b.netCost < a.netCost) {
            return sortMultiplier
        }
        return 0
    })
    return { sortedBests, orderbookErrors: errors }
}

export const formatExchangeName = (exchange: string): string => {
    if (exchange in formattedExchangeNames) {
        return formattedExchangeNames[exchange] as string
    }
    return exchange
}

export function toIsoString(date: Date) {
    const tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = (num: number) => (num < 10 ? '0' : '') + num

    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()) +
        'T' +
        pad(date.getHours()) +
        ':' +
        pad(date.getMinutes()) +
        ':' +
        pad(date.getSeconds()) +
        dif +
        pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' +
        pad(Math.abs(tzo) % 60)
    )
}

export function getExchangeUrl(exchange: string, coin?: string, quote?: string): string {
    const params = new URLSearchParams({
        ...(coin && { coin }),
        ...(quote && { quote }),
    })
    return coin && quote ? `/launch/${exchange}?${params.toString()}` : `/launch/${exchange}`
}

export const median = (array: number[]): number | undefined => {
    if (array.length === 0) {
        return undefined
    }
    array.sort((a: number, b: number) => b - a)
    const length = array.length
    if (length % 2 === 0) {
        const upper = array[length / 2]
        const lower = array[length / 2 - 1]
        if (upper === undefined || lower === undefined) {
            return undefined
        }
        return (upper + lower) / 2
    }

    const middle = array[Math.floor(length / 2)]
    return middle
}
