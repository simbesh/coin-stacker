import { BrOrderBookResponse, CjOrderBookResponse, CsOrderBookResponseOk, D1OrderBookResponse } from '@/types/types'
import { type ClassValue, clsx } from 'clsx'
import { round } from 'lodash'
import { twMerge } from 'tailwind-merge'

export const OLD_KRAKEN_TAKER_FEE = 0.0026

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const stableCoins = ['USDT', 'USDC']
const stableBaseFeeOverride: Record<string, number> = {
    coinjar: 0.00001,
    kraken: 0.002,
}
const stableQuoteFeeOverride: Record<string, number> = {
    coinjar: 0.0006,
}

const formattedExchangeNames: Record<string, string> = {
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
    day1x: 'Day1x',
    // elbaite: 'Elbaite',
}

export const defaultExchangeFees: Record<string, number> = {
    btcmarkets: 0.0085,
    independentreserve: 0.005,
    kraken: 0.004,
    luno: 0.001,
    coinspot: 0.001,
    coinjar: 0.001,
    bitaroo: 0.0019,
    swyftx: 0.006,
    coinstash: 0.0085,
    cointree: 0.0075,
    digitalsurge: 0.005,
    okx: 0.005,
    hardblock: 0,
    day1x: 0.0025,
    // elbaite: 0.011,
}
export const defaultEnabledExchanges: Record<string, boolean> = {
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
    day1x: true,
    // elbaite: true,
}

export function currencyFormat(num: number, currencyCode: string = 'AUD', digits: number = 2): string {
    const options = {
        style: 'currency' as const,
        currency: currencyCode,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }
    return new Intl.NumberFormat('en-AU', options).format(num)
}

function parseOrderBookStringTuple(tuple: [string, string]): [number, number] {
    return [parseFloat(tuple[0]), parseFloat(tuple[1])]
}

export function parseBrOrderBook(data: BrOrderBookResponse): any {
    return {
        bids: data.buy.map(({ price, amount }) => parseOrderBookStringTuple([price, amount])) as [number, number][],
        asks: data.sell.map(({ price, amount }) => parseOrderBookStringTuple([price, amount])) as [number, number][],
    }
}

export function parseD1OrderBook(data: D1OrderBookResponse): any {
    return {
        bids: data.bids.map(parseOrderBookStringTuple),
        asks: data.asks.map(parseOrderBookStringTuple),
    }
}

export function parseCjOrderBook(data: CjOrderBookResponse): any {
    const timestamp = Date.now()
    return {
        bids: data.bids.map(parseOrderBookStringTuple),
        asks: data.asks.map(parseOrderBookStringTuple),
        timestamp,
        datetime: new Date(timestamp).toISOString(),
        nonce: timestamp,
    }
}

export function parseCsOrderBook(data: CsOrderBookResponseOk): any {
    const bids: [number, number][] = data.buyorders.map(({ rate, amount }) => [rate, amount])
    const asks: [number, number][] = data.sellorders.map(({ rate, amount }) => [rate, amount])
    const timestamp = Date.now()

    let bidLevel, askLevel
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

type Best = {
    exchange: string
    netCost: number
    grossPrice: number
    netPrice: number
    grossAveragePrice: number
    fees: number
    feeRate: number
}

export function getBestOrders(
    orderbooks: Record<string, any>,
    amount: number,
    exchangeFees: Record<string, number>,
    base: string,
    quote: string,
    side: 'buy' | 'sell',
    currency: string
): { sortedBests: Best[]; orderbookErrors: { name: string; error: { name: string } }[] } {
    let sortedBests: Best[] = []
    const errors = []
    for (const [exchange, orderbook] of Object.entries(orderbooks)) {
        if (orderbook.error) {
            continue
        } else if (
            orderbook.value === undefined ||
            orderbook.value[side === 'buy' ? 'asks' : 'bids']?.flat().includes(NaN)
        ) {
            errors.push({
                name: exchange,
                error: { name: orderbook.error ?? 'could not get price' },
            })
            continue
        }

        let grossCost = 0
        let grossPrice = side === 'buy' ? -Infinity : Infinity
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
            } else {
                amountLeft -= volume
                grossCost += grossPrice * volume
            }
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

        const priceCheck = side === 'buy' ? grossPrice > -Infinity : grossPrice < Infinity
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
        return a.netCost < b.netCost ? -sortMultiplier : b.netCost < a.netCost ? sortMultiplier : 0
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
        pad = function (num: number) {
            return (num < 10 ? '0' : '') + num
        }

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
