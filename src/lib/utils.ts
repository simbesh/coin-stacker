import { BrOrderBookResponse, CjOrderBookResponse, CsOrderBookResponse } from '@/types/types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const formattedExchangeNames: Record<string, string> = {
    btcmarkets: 'BTC Markets',
    independentreserve: 'Ind Reserve',
    kraken: 'Kraken',
    luno: 'Luno',
    coinspot: 'CoinSpot',
    coinjar: 'CoinJar',
    bitaroo: 'Bitaroo',
    swyftx: 'Swyftx',
}

export const exchangeFees: Record<string, number> = {
    btcmarkets: 0.0085,
    independentreserve: 0.005,
    kraken: 0.0026,
    luno: 0.001,
    coinspot: 0.001,
    coinjar: 0.001,
    bitaroo: 0.0019,
    swyftx: 0.006,
}
export const defaultEnabledExchanges: string[] = [
    'btcmarkets',
    'independentreserve',
    'kraken',
    'luno',
    'coinspot',
    'coinjar',
    'bitaroo',
    'swyftx',
]

export function currencyFormat(num: number, currencyCode: string = 'AUD', digits: number = 2): string {
    const options = {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }
    return new Intl.NumberFormat('en-AU', options).format(num)
}

export function parseBrOrderBook(data: BrOrderBookResponse): any {
    let bids = data.buy.map((bid) => [parseFloat(bid.price), parseFloat(bid.amount)]) as [number, number][]
    let asks = data.sell.map((ask) => [parseFloat(ask.price), parseFloat(ask.amount)]) as [number, number][]
    return {
        bids,
        asks,
    }
}

export function parseCjOrderBook(data: CjOrderBookResponse): any {
    let bids = data.bids.map((bid) => [parseFloat(bid[0]), parseFloat(bid[1])]) as [number, number][]
    let asks = data.asks.map((ask) => [parseFloat(ask[0]), parseFloat(ask[1])]) as [number, number][]
    const timestamp = Date.now()
    return {
        bids,
        asks,
        timestamp,
        datetime: new Date(timestamp).toISOString(),
        nonce: timestamp,
    }
}

export function parseCsOrderBook(data: CsOrderBookResponse): any {
    const bids: [number, number][] = data.buyorders.map((o) => [o.rate, o.amount])
    const asks: [number, number][] = data.sellorders.map((o) => [o.rate, o.amount])
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
}

export function getBestAsks(orderbooks: any, amountToBuy: number, exchangeFees: Record<string, number>): Best[] {
    let sortedBests: Best[] = []
    let errors = []
    for (let exchange of Object.keys(orderbooks)) {
        if (orderbooks[exchange].value === undefined) {
            errors.push({
                exchange,
                error: orderbooks[exchange].error,
            })
            continue
        }
        let grossCost = 0
        let grossPrice = -Infinity
        let askGrossAveragePrice = -Infinity
        let askVolume = 0
        let amountLeftToBuy = amountToBuy
        for (let ask of orderbooks[exchange].value.asks || []) {
            grossPrice = ask[0]
            askVolume = ask[1]
            if (askVolume >= amountLeftToBuy) {
                grossCost += grossPrice * amountLeftToBuy
                break
            } else {
                amountLeftToBuy -= askVolume
                grossCost += grossPrice * askVolume
            }
        }
        let feeRate = exchangeFees[exchange] ?? 0
        let fees = grossCost * feeRate
        let netCost = grossCost + fees
        let netPrice = grossPrice * (1 + feeRate)

        if (
            grossPrice > -Infinity &&
            // && exchangeAudBal >= askNetCost
            // && grossCost >= minOrderCost
            askVolume >= amountLeftToBuy
        ) {
            sortedBests.push({
                exchange,
                netCost, // sort by lowest askNetCost (fee adjusted)
                grossPrice, // use to place order at this price
                netPrice,
                grossAveragePrice: grossCost / amountToBuy,
                fees,
            })
        }
        // }
    }
    sortedBests = sortedBests.sort((a, b) => (a.netCost < b.netCost ? -1 : b.netCost < a.netCost ? 1 : 0))
    // sortedBests.push(...errors)
    return sortedBests
}

export function getBestBids(orderbooks: any, amountToSell: number, exchangeFees: Record<string, number>): Best[] {
    let sortedBests: Best[] = []
    let errors = []
    for (let exchange of Object.keys(orderbooks)) {
        if (orderbooks[exchange].value === undefined) {
            errors.push({
                exchange,
                error: orderbooks[exchange].error,
            })
            continue
        }
        let grossCost = 0
        let grossPrice = Infinity
        let bidVolume = 0
        let amountLeftToSell = amountToSell
        for (let bid of orderbooks[exchange].value.bids || []) {
            grossPrice = bid[0]
            bidVolume = bid[1]
            if (bidVolume >= amountLeftToSell) {
                grossCost += grossPrice * amountLeftToSell
                break
            } else {
                amountLeftToSell -= bidVolume
                grossCost += grossPrice * bidVolume
            }
        }
        let feeRate = exchangeFees[exchange] ?? 0
        let fees = grossCost * feeRate
        let netCost = grossCost - fees
        let netPrice = grossPrice * (1 - feeRate)

        if (grossPrice < Infinity && bidVolume >= amountLeftToSell) {
            sortedBests.push({
                exchange,
                netCost, // sort by lowest bidNetCost (fee adjusted)
                grossPrice, // use to place order at this price
                netPrice,
                grossAveragePrice: grossCost / amountToSell,
                fees,
            })
        }
    }

    sortedBests = sortedBests.sort((a, b) => (a.netCost < b.netCost ? 1 : b.netCost < a.netCost ? -1 : 0))
    // sortedBests.push(...errors)
    return sortedBests
}

export const formatExchangeName = (exchange: string): string => {
    if (exchange in formattedExchangeNames) {
        return formattedExchangeNames[exchange] as string
    }
    return exchange
}
