'use client'

import ExchangeIcon from '@/components/ExchangeIcon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, defaultExchangeFees, exchangeTypes, formatExchangeName, getExchangeUrl } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type WithdrawalFeeSource = 'dynamic' | 'static' | 'free' | 'unavailable'

const comparisonVolumes = [0, 1_000, 10_000] as const

const feeTierCurves: Partial<Record<string, Array<[number, number]>>> = {
    independentreserve: [
        [0, 0.5],
        [50_000, 0.48],
        [100_000, 0.46],
        [200_000, 0.44],
        [300_000, 0.42],
        [400_000, 0.4],
        [500_000, 0.38],
        [600_000, 0.36],
        [800_000, 0.34],
        [1_000_000, 0.32],
        [1_200_000, 0.3],
        [1_400_000, 0.28],
        [1_600_000, 0.26],
        [1_800_000, 0.24],
        [2_000_000, 0.22],
        [2_500_000, 0.2],
        [3_000_000, 0.18],
        [3_500_000, 0.16],
        [4_000_000, 0.14],
        [4_500_000, 0.12],
        [5_000_000, 0.1],
        [10_000_000, 0.08],
        [15_000_000, 0.07],
        [30_000_000, 0.06],
        [50_000_000, 0.05],
        [100_000_000, 0.04],
        [150_000_000, 0.03],
        [200_000_000, 0.02],
    ],
    btcmarkets: [
        [0, 0.85],
        [500, 0.83],
        [1_000, 0.8],
        [3_000, 0.75],
        [9_000, 0.7],
        [18_000, 0.65],
        [40_000, 0.6],
        [60_000, 0.55],
        [70_000, 0.5],
        [80_000, 0.45],
        [90_000, 0.4],
        [115_000, 0.35],
        [125_000, 0.3],
        [200_000, 0.25],
        [400_000, 0.23],
        [650_000, 0.2],
        [850_000, 0.18],
        [1_000_000, 0.15],
        [3_000_000, 0.13],
        [5_000_000, 0.13],
    ],
    coinjar: [
        [0, 0.1],
        [100_000, 0.1],
        [400_000, 0.1],
        [1_000_000, 0.08],
        [10_000_000, 0.06],
    ],
    coinspot: [
        [0, 0.1],
        [200_000_000, 0.1],
    ],
    kraken: [
        [0, 0.4],
        [10_000, 0.35],
        [50_000, 0.24],
        [100_000, 0.22],
        [250_000, 0.2],
        [500_000, 0.18],
        [1_000_000, 0.16],
        [2_500_000, 0.14],
        [5_000_000, 0.12],
        [10_000_000, 0.1],
        [100_000_000, 0.08],
        [250_000_000, 0.06],
        [500_000_000, 0.04],
    ],
    luno: [
        [0, 0.1],
        [350_000, 0.09],
        [700_000, 0.08],
        [1_400_000, 0.07],
        [2_800_000, 0.06],
        [5_600_000, 0.05],
        [8_400_000, 0.04],
        [11_200_000, 0.03],
    ],
    bitaroo: [
        [0, 0.19],
        [10_000, 0.15],
        [1_000_000, 0.09],
        [5_000_000, 0.07],
        [10_000_000, 0.05],
    ],
    swyftx: [
        [0, 0.6],
        [100_000, 0.55],
        [300_000, 0.5],
        [400_000, 0.45],
        [500_000, 0.4],
        [1_000_000, 0.35],
        [3_000_000, 0.3],
        [4_000_000, 0.25],
        [5_000_000, 0.2],
        [6_000_000, 0.1],
    ],
    coinstash: [[0, 0.85]],
    cointree: [
        [0, 0.75],
        [30_000, 0.6],
        [100_000, 0.5],
    ],
    okx: [
        [0, 0.5],
        [1_500_001, 0.3],
        [7_500_001, 0.1],
        [15_000_001, 0.09],
        [30_000_001, 0.08],
        [200_000_001, 0.04],
        [500_000_001, 0.03],
        [1_000_000_001, 0.025],
        [1_500_000_001, 0.02],
    ],
    wayex: [
        [0, 0.2],
        [100_000, 0.15],
        [500_000, 0.1],
    ],
}

const withdrawalFeeSourceByExchange: Record<string, WithdrawalFeeSource> = {
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
    wayex: 'unavailable',
    coinjar: 'unavailable',
    cointree: 'unavailable',
    kraken: 'unavailable',
}

const heatClasses = [
    'text-green-600 dark:text-green-400',
    'text-lime-600 dark:text-lime-400',
    'text-yellow-600 dark:text-yellow-400',
    'text-orange-600 dark:text-orange-400',
    'text-red-600 dark:text-red-400',
]

function getFeeRateAtVolume(exchange: string, volume: number): number {
    const fallbackRate = (defaultExchangeFees[exchange] ?? 0) * 100
    const tiers = feeTierCurves[exchange]

    if (!tiers || tiers.length === 0) {
        return fallbackRate
    }

    let currentRate = tiers[0]?.[1] ?? fallbackRate
    for (const [threshold, feeRate] of tiers) {
        if (volume >= threshold) {
            currentRate = feeRate
        }
    }

    return currentRate
}

function formatRate(rate: number): string {
    if (rate === 0) {
        return '0%'
    }
    return `${rate.toFixed(rate < 0.1 ? 3 : 2)}%`
}

function formatBtcWithdrawalFee(fee: number | null | undefined): string {
    if (fee === undefined) {
        return 'Loading...'
    }
    if (fee === null) {
        return 'Unavailable'
    }
    if (fee === 0) {
        return 'Free'
    }
    return `${fee.toFixed(8).replace(/\.?0+$/, '')} BTC`
}

function getHeatClass(value: number, min: number, max: number): string {
    if (max <= min) {
        return 'text-foreground'
    }

    const ratio = (value - min) / (max - min)
    const index = Math.min(heatClasses.length - 1, Math.max(0, Math.round(ratio * (heatClasses.length - 1))))

    return heatClasses[index] ?? 'text-foreground'
}

function formatSourceLabel(source: WithdrawalFeeSource): string {
    if (source === 'dynamic') return 'Dynamic'
    if (source === 'static') return 'Static'
    if (source === 'free') return 'Free'
    return 'Unknown'
}

const ExchangesPageContent = () => {
    const exchanges = useMemo(() => Object.keys(defaultExchangeFees), [])
    const [btcWithdrawalFees, setBtcWithdrawalFees] = useState<Record<string, number | null>>({})

    const feeRows = useMemo(
        () =>
            exchanges.map((exchange) => ({
                exchange,
                rates: comparisonVolumes.map((volume) => getFeeRateAtVolume(exchange, volume)),
            })),
        [exchanges]
    )

    const volumeExtremes = useMemo(
        () =>
            comparisonVolumes.map((_, volumeIndex) => {
                const values = feeRows.map((row) => row.rates[volumeIndex] ?? 0)
                const min = Math.min(...values)
                const max = Math.max(...values)

                return {
                    min,
                    max,
                    winners: feeRows
                        .filter((row) => (row.rates[volumeIndex] ?? Infinity) === min)
                        .map((row) => formatExchangeName(row.exchange)),
                }
            }),
        [feeRows]
    )

    const brokerCount = exchanges.filter((exchange) => exchangeTypes[exchange] === 'broker').length
    const orderBookCount = exchanges.length - brokerCount

    useEffect(() => {
        let cancelled = false

        const fetchFees = async () => {
            const entries = await Promise.all(
                exchanges.map(async (exchange) => {
                    try {
                        const response = await fetch(`/api/exchange/withdrawal-fee?exchange=${exchange}&currency=BTC`)
                        if (!response.ok) {
                            return [exchange, null] as const
                        }

                        const data = (await response.json()) as {
                            fees?: Record<string, number>
                        }
                        const fee = data.fees?.BTC ?? data.fees?.XBT ?? data.fees?.override
                        return [exchange, typeof fee === 'number' ? fee : null] as const
                    } catch {
                        return [exchange, null] as const
                    }
                })
            )

            if (!cancelled) {
                setBtcWithdrawalFees(Object.fromEntries(entries))
            }
        }

        void fetchFees()

        return () => {
            cancelled = true
        }
    }, [exchanges])

    return (
        <div className="container z-20 flex w-full max-w-7xl flex-col gap-4 px-0 pb-4 pt-2 sm:gap-6 sm:pb-8 sm:pt-6">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl sm:text-3xl">Exchanges</CardTitle>
                    <CardDescription>
                        Compare exchange type, fee rate by volume, and BTC withdrawal fee. Exchange icons link to each
                        internal affiliate redirect.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border bg-background/70 p-3">
                            <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                Exchanges tracked
                            </div>
                            <div className="mt-1 text-2xl font-semibold">{exchanges.length}</div>
                        </div>
                        <div className="rounded-lg border bg-background/70 p-3">
                            <div className="text-muted-foreground text-xs uppercase tracking-wide">Type split</div>
                            <div className="mt-1 text-sm font-semibold">
                                {orderBookCount} Order Book / {brokerCount} Broker
                            </div>
                        </div>
                        <div className="rounded-lg border bg-background/70 p-3">
                            <div className="text-muted-foreground text-xs uppercase tracking-wide">Lowest at $0</div>
                            <div className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatRate(volumeExtremes[0]?.min ?? 0)} -{' '}
                                {(volumeExtremes[0]?.winners ?? []).join(', ')}
                            </div>
                        </div>
                        <div className="rounded-lg border bg-background/70 p-3">
                            <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                Lowest at $10,000
                            </div>
                            <div className="mt-1 text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatRate(volumeExtremes[2]?.min ?? 0)} -{' '}
                                {(volumeExtremes[2]?.winners ?? []).join(', ')}
                            </div>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead rowSpan={2}>Exchange</TableHead>
                                <TableHead rowSpan={2}>Exchange Type</TableHead>
                                <TableHead className="text-center" colSpan={3}>
                                    Fee rate (%) by 30d volume
                                </TableHead>
                                <TableHead rowSpan={2} className="text-right">
                                    BTC withdrawal fee
                                </TableHead>
                            </TableRow>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-right">$0</TableHead>
                                <TableHead className="text-right">$1,000</TableHead>
                                <TableHead className="text-right">$10,000</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feeRows.map((row) => {
                                const exchangeType = exchangeTypes[row.exchange] === 'broker' ? 'Broker' : 'Order Book'
                                const btcFee = btcWithdrawalFees[row.exchange]
                                return (
                                    <TableRow key={row.exchange}>
                                        <TableCell className="min-w-48">
                                            <Link
                                                href={getExchangeUrl(row.exchange)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group inline-flex items-center gap-2 underline hover:text-amber-500 dark:hover:text-amber-400"
                                            >
                                                <ExchangeIcon exchange={row.exchange} withLabel />
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                                    exchangeType === 'Broker'
                                                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                )}
                                            >
                                                {exchangeType}
                                            </span>
                                        </TableCell>
                                        {row.rates.map((rate, index) => {
                                            const volumeExtreme = volumeExtremes[index]
                                            return (
                                                <TableCell
                                                    key={`${row.exchange}-${comparisonVolumes[index]}`}
                                                    className={cn(
                                                        'text-right font-mono font-semibold',
                                                        getHeatClass(
                                                            rate,
                                                            volumeExtreme?.min ?? rate,
                                                            volumeExtreme?.max ?? rate
                                                        )
                                                    )}
                                                >
                                                    {formatRate(rate)}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell
                                            className={cn(
                                                'text-right font-mono',
                                                btcFee === 0 && 'text-green-600 dark:text-green-400',
                                                btcFee === null && 'text-muted-foreground'
                                            )}
                                        >
                                            {formatBtcWithdrawalFee(btcFee)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Feature Matrix</CardTitle>
                    <CardDescription>
                        Quick side-by-side view of feature support and fee model metadata.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-52">Feature</TableHead>
                                {exchanges.map((exchange) => (
                                    <TableHead key={`${exchange}-matrix-header`} className="min-w-32 text-center">
                                        <div className="flex items-center justify-center">
                                            <ExchangeIcon exchange={exchange} withLabel labelClassName="text-xs" />
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Exchange type</TableCell>
                                {exchanges.map((exchange) => {
                                    const value = exchangeTypes[exchange] === 'broker' ? 'Broker' : 'Order Book'
                                    return (
                                        <TableCell key={`${exchange}-feature-type`} className="text-center text-xs">
                                            {value}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Volume fee tiers</TableCell>
                                {exchanges.map((exchange) => {
                                    const hasTiers = (feeTierCurves[exchange]?.length ?? 0) > 1
                                    return (
                                        <TableCell
                                            key={`${exchange}-feature-tiers`}
                                            className={cn(
                                                'text-center text-xs font-semibold',
                                                hasTiers
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-muted-foreground'
                                            )}
                                        >
                                            {hasTiers ? 'Yes' : 'No'}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Fee source type</TableCell>
                                {exchanges.map((exchange) => {
                                    const source = withdrawalFeeSourceByExchange[exchange] ?? 'unavailable'
                                    return (
                                        <TableCell
                                            key={`${exchange}-feature-source`}
                                            className={cn(
                                                'text-center text-xs font-semibold',
                                                source === 'dynamic' && 'text-blue-600 dark:text-blue-400',
                                                source === 'static' && 'text-amber-600 dark:text-amber-400',
                                                source === 'free' && 'text-green-600 dark:text-green-400',
                                                source === 'unavailable' && 'text-muted-foreground'
                                            )}
                                        >
                                            {formatSourceLabel(source)}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">BTC withdrawal fee available</TableCell>
                                {exchanges.map((exchange) => {
                                    const value = btcWithdrawalFees[exchange]
                                    const hasData = value !== null && value !== undefined
                                    const isLoading = value === undefined

                                    return (
                                        <TableCell
                                            key={`${exchange}-feature-withdraw-available`}
                                            className={cn(
                                                'text-center text-xs font-semibold',
                                                isLoading && 'text-muted-foreground',
                                                !isLoading && hasData && 'text-green-600 dark:text-green-400',
                                                !isLoading && !hasData && 'text-red-600 dark:text-red-400'
                                            )}
                                        >
                                            {isLoading ? 'Loading' : hasData ? 'Yes' : 'No'}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default ExchangesPageContent
