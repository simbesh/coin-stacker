'use client'

import * as React from 'react'
import { Area, AreaChart, Bar, BarChart, Brush, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import ExchangeIcon from '@/components/ExchangeIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { currencyFormat } from '@/lib/utils'

type Tier = readonly [volume: number, feePercent: number]

type ExchangeSeries = {
    label: string
    color: string
    tiers: readonly Tier[]
    strokeDasharray?: string
}

const EXCHANGE_SERIES = {
    btcmarkets: {
        label: 'BTC Markets',
        color: '#16a34a',
        tiers: [
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
    },
    independentreserve: {
        label: 'Independent Reserve',
        color: '#2563eb',
        tiers: [
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
    },
    kraken: {
        label: 'Kraken',
        color: '#7c3aed',
        tiers: [
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
    },
    coinjar: {
        label: 'CoinJar',
        color: '#f97316',
        tiers: [
            [0, 0.1],
            [100_000, 0.1],
            [400_000, 0.1],
            [1_000_000, 0.08],
            [10_000_000, 0.06],
        ],
    },
    coinspot: {
        label: 'CoinSpot',
        color: '#dc2626',
        strokeDasharray: '12 10',
        tiers: [
            [0, 0.1],
            [200_000_000, 0.1],
        ],
    },
    luno: {
        label: 'Luno',
        color: '#1d4ed8',
        strokeDasharray: '4 6',
        tiers: [
            [0, 0.1],
            [350_000, 0.09],
            [700_000, 0.08],
            [1_400_000, 0.07],
            [2_800_000, 0.06],
            [5_600_000, 0.05],
            [8_400_000, 0.04],
            [11_200_000, 0.03],
        ],
    },
    bitaroo: {
        label: 'Bitaroo',
        color: '#ea580c',
        tiers: [
            [0, 0.19],
            [10_000, 0.15],
            [1_000_000, 0.09],
            [5_000_000, 0.07],
            [10_000_000, 0.05],
        ],
    },
    swyftx: {
        label: 'Swyftx',
        color: '#6b7280',
        tiers: [
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
    },
    coinstash: {
        label: 'Coinstash',
        color: '#4f46e5',
        tiers: [[0, 0.85]],
    },
    cointree: {
        label: 'Cointree',
        color: '#10b981',
        tiers: [
            [0, 0.75],
            [30_000, 0.6],
            [100_000, 0.5],
        ],
    },
    okx: {
        label: 'OKX',
        color: '#111827',
        tiers: [
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
    },
    wayex: {
        label: 'Wayex',
        color: '#059669',
        tiers: [
            [0, 0.2],
            [100_000, 0.15],
            [500_000, 0.1],
        ],
    },
} satisfies Record<string, ExchangeSeries>

type ExchangeId = keyof typeof EXCHANGE_SERIES

type FeeCurvePoint = {
    volume: number
} & Record<ExchangeId, number>

type FeeSnapshotPoint = {
    exchange: ExchangeId
    label: string
    fee: number
}

const SNAPSHOT_VOLUMES = [0, 1_000, 10_000, 100_000, 500_000, 1_000_000, 5_000_000] as const

const exchangeIds = Object.keys(EXCHANGE_SERIES) as ExchangeId[]

const chartConfig: ChartConfig = Object.fromEntries(
    exchangeIds.map((exchangeId) => [
        exchangeId,
        {
            label: EXCHANGE_SERIES[exchangeId].label,
            color: EXCHANGE_SERIES[exchangeId].color,
        },
    ])
)

const compactAudFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    notation: 'compact',
    maximumFractionDigits: 1,
})

const formatCompactAud = (value: number) => compactAudFormatter.format(value)

const formatFee = (fee: number) =>
    `${fee
        .toFixed(3)
        .replace(/\.0+$/, '')
        .replace(/(\.\d*?)0+$/, '$1')}%`

const TooltipExchangeLabel = ({ exchangeId }: { exchangeId: ExchangeId }) => (
    <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-[4px]" style={{ backgroundColor: EXCHANGE_SERIES[exchangeId].color }} />
        <ExchangeIcon
            exchange={exchangeId}
            withLabel
            className="gap-1.5"
            imageClassName="size-4 rounded-[3px]"
            labelClassName="text-muted-foreground"
        />
    </div>
)

function getFeeForVolume(tiers: readonly Tier[], volume: number): number {
    let currentFee = tiers[0]?.[1] ?? 0

    for (const [minVolume, fee] of tiers) {
        if (volume >= minVolume) {
            currentFee = fee
            continue
        }

        break
    }

    return currentFee
}

function buildFeeCurveData(): FeeCurvePoint[] {
    const volumes = new Set<number>()

    exchangeIds.forEach((exchangeId) => {
        EXCHANGE_SERIES[exchangeId].tiers.forEach(([volume]) => {
            volumes.add(volume)
        })
    })

    return [...volumes]
        .sort((a, b) => a - b)
        .map((volume) => {
            const point = { volume } as FeeCurvePoint

            exchangeIds.forEach((exchangeId) => {
                point[exchangeId] = getFeeForVolume(EXCHANGE_SERIES[exchangeId].tiers, volume)
            })

            return point
        })
}

const feeCurveData = buildFeeCurveData()

const createVisibilityState = (enabled: boolean): Record<ExchangeId, boolean> =>
    exchangeIds.reduce(
        (state, exchangeId) => {
            state[exchangeId] = enabled
            return state
        },
        {} as Record<ExchangeId, boolean>
    )

const ExchangeFeesDashboard = () => {
    const [visibleExchanges, setVisibleExchanges] = React.useState<Record<ExchangeId, boolean>>(() =>
        createVisibilityState(true)
    )
    const [snapshotVolume, setSnapshotVolume] = React.useState<number>(100_000)

    const visibleExchangeIds = React.useMemo(
        () => exchangeIds.filter((exchangeId) => visibleExchanges[exchangeId]),
        [visibleExchanges]
    )

    const snapshotData = React.useMemo<FeeSnapshotPoint[]>(() => {
        return visibleExchangeIds
            .map((exchangeId) => ({
                exchange: exchangeId,
                label: EXCHANGE_SERIES[exchangeId].label,
                fee: getFeeForVolume(EXCHANGE_SERIES[exchangeId].tiers, snapshotVolume),
            }))
            .sort((a, b) => a.fee - b.fee)
    }, [snapshotVolume, visibleExchangeIds])

    const bestSnapshot = snapshotData[0]
    const worstSnapshot = snapshotData.at(-1)
    const spread = bestSnapshot && worstSnapshot ? worstSnapshot.fee - bestSnapshot.fee : 0

    return (
        <main className="relative z-20 container py-6 sm:py-10">
            <div className="mx-auto max-w-7xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Exchange Fee Curves</CardTitle>
                        <CardDescription>
                            Compare taker fee tiers by AUD trading volume. Toggle exchanges to focus the chart.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={() => setVisibleExchanges(createVisibilityState(true))}
                                size="sm"
                                variant="outline"
                            >
                                Show all
                            </Button>
                            <Button
                                onClick={() => setVisibleExchanges(createVisibilityState(false))}
                                size="sm"
                                variant="outline"
                            >
                                Hide all
                            </Button>
                            <span className="text-muted-foreground ml-auto text-xs">
                                {visibleExchangeIds.length} of {exchangeIds.length} exchanges visible
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {exchangeIds.map((exchangeId) => {
                                const isVisible = visibleExchanges[exchangeId]

                                return (
                                    <Button
                                        key={exchangeId}
                                        onClick={() =>
                                            setVisibleExchanges((current) => ({
                                                ...current,
                                                [exchangeId]: !current[exchangeId],
                                            }))
                                        }
                                        size="sm"
                                        variant={isVisible ? 'default' : 'outline'}
                                        className="h-8"
                                    >
                                        <span
                                            className="mr-1.5 size-2 rounded-full"
                                            style={{ backgroundColor: EXCHANGE_SERIES[exchangeId].color }}
                                        />
                                        {EXCHANGE_SERIES[exchangeId].label}
                                    </Button>
                                )
                            })}
                        </div>

                        <ChartContainer config={chartConfig} className="h-[500px] w-full">
                            <AreaChart
                                accessibilityLayer
                                data={feeCurveData}
                                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="volume"
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={24}
                                    tickMargin={8}
                                    tickFormatter={(value) => formatCompactAud(Number(value))}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={40}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <ChartTooltip
                                    cursor={{ strokeDasharray: '4 4' }}
                                    content={
                                        <ChartTooltipContent
                                            indicator="line"
                                            hideIndicator
                                            labelFormatter={(_, payload) => {
                                                const point = payload[0]?.payload as FeeCurvePoint | undefined
                                                if (!point) {
                                                    return null
                                                }

                                                return `AUD Volume: ${currencyFormat(point.volume, 'AUD', 0)}`
                                            }}
                                            formatter={(value, name) => {
                                                const exchangeId = String(name) as ExchangeId

                                                return (
                                                    <div className="flex min-w-[10rem] items-center justify-between gap-3">
                                                        <TooltipExchangeLabel exchangeId={exchangeId} />
                                                        <span className="font-mono tabular-nums">
                                                            {formatFee(Number(value))}
                                                        </span>
                                                    </div>
                                                )
                                            }}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
                                {exchangeIds.map((exchangeId) => (
                                    <Area
                                        key={exchangeId}
                                        dataKey={exchangeId}
                                        type="stepAfter"
                                        stroke={`var(--color-${exchangeId})`}
                                        fill={`var(--color-${exchangeId})`}
                                        fillOpacity={0.14}
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls
                                        strokeDasharray={
                                            (EXCHANGE_SERIES[exchangeId] as ExchangeSeries).strokeDasharray
                                        }
                                        hide={!visibleExchanges[exchangeId]}
                                    />
                                ))}
                                <Brush
                                    dataKey="volume"
                                    tickFormatter={(value) => formatCompactAud(Number(value))}
                                    stroke="hsl(var(--border))"
                                    height={28}
                                    travellerWidth={9}
                                />
                            </AreaChart>
                        </ChartContainer>

                        <p className="text-muted-foreground text-xs">
                            Tip: use the exchange buttons to focus the chart, then drag the brush handles to zoom into a
                            volume range.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-4">
                        <div>
                            <CardTitle>Fee Ranking Snapshot</CardTitle>
                            <CardDescription>Compare rates at a single trade size.</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SNAPSHOT_VOLUMES.map((volume) => (
                                <Button
                                    key={volume}
                                    onClick={() => setSnapshotVolume(volume)}
                                    size="sm"
                                    variant={snapshotVolume === volume ? 'default' : 'outline'}
                                >
                                    {currencyFormat(volume, 'AUD', 0)}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ChartContainer config={chartConfig} className="h-[420px] w-full">
                            <BarChart
                                accessibilityLayer
                                data={snapshotData}
                                layout="vertical"
                                margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
                            >
                                <CartesianGrid horizontal={false} />
                                <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={130} />
                                <XAxis
                                    type="number"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => formatFee(Number(value))}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            hideIndicator
                                            hideLabel
                                            formatter={(value, _name, item) => {
                                                const exchangeId = (item.payload as FeeSnapshotPoint).exchange

                                                return (
                                                    <div className="flex min-w-[10rem] items-center justify-between gap-3">
                                                        <TooltipExchangeLabel exchangeId={exchangeId} />
                                                        <span className="font-mono tabular-nums">
                                                            {formatFee(Number(value))}
                                                        </span>
                                                    </div>
                                                )
                                            }}
                                        />
                                    }
                                />
                                <Bar dataKey="fee" radius={4}>
                                    {snapshotData.map((entry) => (
                                        <Cell key={entry.exchange} fill={`var(--color-${entry.exchange})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>

                        {bestSnapshot && worstSnapshot ? (
                            <p className="text-sm">
                                At <span className="font-medium">{currencyFormat(snapshotVolume, 'AUD', 0)}</span>,
                                <span className="font-medium"> {bestSnapshot.label}</span> has the lowest fee at
                                <span className="font-medium"> {formatFee(bestSnapshot.fee)}</span>. Spread to highest
                                fee is
                                <span className="font-medium"> {formatFee(spread)}</span>.
                            </p>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Enable at least one exchange to view the ranking chart.
                            </p>
                        )}

                        <p className="text-muted-foreground text-xs">
                            Fee tiers are inherited from the legacy page data. Wayex is still a placeholder schedule
                            until official fee tiers are published.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default ExchangeFeesDashboard
