'use client'

import { useLocalStorage } from '@uidotdev/usehooks'
import { type ComponentProps, useState } from 'react'
import { Area, AreaChart, Brush, Legend, ResponsiveContainer, Tooltip, type TooltipProps, XAxis, YAxis } from 'recharts'
import { LocalStorageKeys } from '@/lib/constants'
import { cn, currencyFormat, defaultEnabledExchanges } from '@/lib/utils'

const strokeWidth = 1.5
interface FeeSeriesPoint {
    [key: string]: number
}

type LegendEvent = Parameters<NonNullable<ComponentProps<typeof Legend>['onClick']>>[0]
const ir = [
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
]

const btcm = [
    [0, 0.85],
    [500, 0.83],
    [1000, 0.8],
    [3000, 0.75],
    [9000, 0.7],
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
]
const cj = [
    [0, 0.1],
    [100_000, 0.1],
    [400_000, 0.1],
    [1_000_000, 0.08],
    [10_000_000, 0.06],
]
const cs = [
    [0, 0.1],
    [200_000_000, 0.1],
]
const kr = [
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
]
const ln = [
    [0, 0.1],
    [350_000, 0.09],
    [700_000, 0.08],
    [1_400_000, 0.07],
    [2_800_000, 0.06],
    [5_600_000, 0.05],
    [8_400_000, 0.04],
    [11_200_000, 0.03],
]

const br = [
    [0, 0.19],
    [10_000, 0.15],
    [1_000_000, 0.09],
    [5_000_000, 0.07],
    [10_000_000, 0.05],
]
const sx = [
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
]
const cstash = [[0, 0.85]]

const ctree = [
    [0, 0.75],
    [30_000, 0.6],
    [100_000, 0.5],
]

const okx = [
    [0, 0.5],
    [1_500_001, 0.3],
    [7_500_001, 0.1],
    [15_000_001, 0.09],
    [30_000_001, 0.08],
    [200_000_001, 0.04],
    [500_000_001, 0.03],
    [1_000_000_001, 0.025],
    [1_500_000_001, 0.02],
]

// TODO: Update with actual Wayex fee tiers when available
const wayex = [
    [0, 0.2],
    [100_000, 0.15],
    [500_000, 0.1],
]

function fillDataPoints(dataMap: Record<string, Record<string, number>>, data: number[][], key: string) {
    for (const i of data) {
        if (i[0] !== undefined && i[1] !== undefined) {
            if (!dataMap[i[0]]) {
                dataMap[i[0]] = { name: i[0] }
            }
            const entry = dataMap[i[0]]
            if (entry) {
                entry[key] = i[1]
            }
        }
    }
}

const dataMap: Record<string, FeeSeriesPoint> = {}
fillDataPoints(dataMap, ir, 'IndepRes')
fillDataPoints(dataMap, btcm, 'BtcMarkets')
fillDataPoints(dataMap, cj, 'CoinJar')
fillDataPoints(dataMap, cs, 'CoinSpot')
fillDataPoints(dataMap, kr, 'Kraken')
fillDataPoints(dataMap, ln, 'Luno')
fillDataPoints(dataMap, br, 'Bitaroo')
fillDataPoints(dataMap, sx, 'Swyftx')
fillDataPoints(dataMap, cstash, 'Coinstash')
fillDataPoints(dataMap, ctree, 'Cointree')
fillDataPoints(dataMap, okx, 'OKX')
fillDataPoints(dataMap, wayex, 'Wayex')

const data: Record<string, number | string>[] = []
let prev: FeeSeriesPoint | undefined
const allLabels = [
    {
        exchange: 'btcmarkets',
        key: 'BtcMarkets',
        colour: '#51e491',
        gradientKey: 'btcmarkets-gradient',
        gradientStop: '35%',
    },
    {
        exchange: 'independentreserve',
        key: 'IndepRes',
        colour: '#4974ff',
        gradientKey: 'independentreserve-gradient',
        gradientStop: '35%',
    },
    { exchange: 'kraken', key: 'Kraken', colour: '#9482ff', gradientKey: 'kraken-gradient', gradientStop: '35%' },
    {
        exchange: 'coinjar',
        key: 'CoinJar',
        colour: '#ff9719',
        gradientKey: 'coinjar-gradient',
        gradientStop: '35%',
    },
    {
        exchange: 'coinspot',
        key: 'CoinSpot',
        colour: '#ec4f4f',
        gradientKey: 'coinspot-gradient',
        gradientStop: '65%',
        strokeDasharray: '30 15',
    },
    {
        exchange: 'luno',
        key: 'Luno',
        colour: '#2639f2',
        gradientKey: 'luno-gradient',
        gradientStop: '65%',
        strokeDasharray: '15 30',
    },
    { exchange: 'bitaroo', key: 'Bitaroo', colour: '#f6740e', gradientKey: 'bitaroo-gradient', gradientStop: '65%' },
    { exchange: 'swyftx', key: 'Swyftx', colour: '#7b7b7b', gradientKey: 'swyftx-gradient', gradientStop: '35%' },
    {
        exchange: 'coinstash',
        key: 'Coinstash',
        colour: '#5c5bd5',
        gradientKey: 'coinstash-gradient',
        gradientStop: '35%',
    },
    {
        exchange: 'cointree',
        key: 'Cointree',
        colour: '#98f1c7',
        gradientKey: 'cointree-gradient',
        gradientStop: '35%',
    },
    {
        exchange: 'okx',
        key: 'OKX',
        colour: '#fff',
        gradientKey: 'okx-gradient',
        gradientStop: '35%',
    },
    {
        exchange: 'wayex',
        key: 'Wayex',
        colour: '#00d4aa',
        gradientKey: 'wayex-gradient',
        gradientStop: '35%',
    },
]

for (const key of Object.keys(dataMap).sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b))) {
    const value = dataMap[key]
    if (value !== undefined && value.name !== undefined) {
        if (!prev) {
            prev = value
        }

        const missing = Object.keys(prev).filter((v) => !Object.keys(value).includes(v))
        for (const missingKey of missing) {
            const previousValue = prev[missingKey]
            if (previousValue !== undefined) {
                value[missingKey] = previousValue
            }
        }

        const dataPoint: Record<string, string | number> = { ...value }
        dataPoint.value = value.name
        dataPoint.name = currencyFormat(value.name, 'AUD', 0)
        data.push(dataPoint)

        for (const valueKey of Object.keys(value)) {
            const currentValue = value[valueKey]
            if (currentValue !== undefined) {
                prev[valueKey] = currentValue
            }
        }
    }
}

const allData = data
const axisStoke = '#4d5784'

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className={cn('w-80 rounded-md bg-card p-2 pl-4')}>
                <p className="label">{`AUD Volume: ${label} `}</p>
                <div className={'grid grid-cols-2'}>
                    {payload.map((line) => (
                        <div className={'font-bold'} key={String(line.name)} style={{ color: line.stroke }}>
                            {`${line.name}: ${line.value}%`}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return null
}

const FeesChart = () => {
    const labels = allLabels
    const [enabledExchanges] = useLocalStorage<Record<string, boolean>>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges,
    )
    const [seriesProps, setSeriesProps] = useState<Record<string, string | undefined | boolean>>(
        labels.reduce(
            (a: Record<string, undefined>, { key }: { key: string }) => {
                a[key] = undefined
                return a
            },
            { hover: undefined },
        ),
    )

    const getLegendDataKey = (event: LegendEvent): string | undefined => {
        if (typeof event.dataKey === 'string') {
            return event.dataKey
        }

        return undefined
    }

    const handleLegendMouseEnter = (event: LegendEvent) => {
        const dataKey = getLegendDataKey(event)
        if (!dataKey) {
            return
        }

        if (navigator.vibrate) {
            navigator.vibrate(75)
        }
        if (!seriesProps[dataKey]) {
            setSeriesProps({ ...seriesProps, hover: dataKey })
        }
    }

    const handleLegendMouseLeave = () => {
        setSeriesProps({ ...seriesProps, hover: undefined })
    }

    const selectSeries = (event: LegendEvent) => {
        const dataKey = getLegendDataKey(event)
        if (!dataKey) {
            return
        }

        setSeriesProps({
            ...seriesProps,
            [dataKey]: !seriesProps[dataKey],
            hover: undefined,
        })
    }

    return (
        <div className={'w-full'}>
            <ResponsiveContainer debounce={100} height={500} width="100%">
                <AreaChart
                    data={allData}
                    height={200}
                    margin={{
                        top: 75,
                        right: 20,
                        left: -15,
                        bottom: 0,
                    }}
                    width={500}
                >
                    <defs>
                        {labels.map(({ colour, gradientKey, gradientStop }) => (
                            <linearGradient id={gradientKey} key={gradientKey} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="5%" stopColor={colour} stopOpacity={0.35} />
                                <stop offset={gradientStop} stopColor={colour} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <XAxis allowDataOverflow={true} dataKey="name" stroke={axisStoke} />
                    <YAxis stroke={axisStoke} />
                    <Legend
                        onClick={selectSeries}
                        onMouseOut={handleLegendMouseLeave}
                        onMouseOver={handleLegendMouseEnter}
                        wrapperStyle={{
                            left: 0,
                            bottom: 0,
                            paddingTop: 16,
                            userSelect: 'none',
                        }}
                    />
                    <Tooltip
                        content={CustomTooltip}
                        contentStyle={{
                            fontWeight: 'bold',
                            minWidth: '11rem',
                            borderColor: 'transparent',
                            borderRadius: '10px',
                        }}
                        formatter={(value, name) => {
                            return [`${value}%`, name]
                        }}
                        position={{ x: 75, y: 0 }}
                    />
                    {labels.map(({ colour, gradientKey, key, strokeDasharray, exchange }) =>
                        enabledExchanges[exchange] ? (
                            <Area
                                connectNulls
                                dataKey={key}
                                dot={false}
                                fill={`url(#${gradientKey})`}
                                fillOpacity={Number(seriesProps.hover === key || !seriesProps.hover ? 0.3 : 0.05)}
                                hide={seriesProps[key] === true}
                                key={exchange}
                                stroke={colour}
                                strokeDasharray={strokeDasharray}
                                strokeOpacity={Number(seriesProps.hover === key || !seriesProps.hover ? 1 : 0.1)}
                                strokeWidth={strokeWidth}
                                type="stepAfter"
                            />
                        ) : null,
                    )}
                    <Brush
                        data={allData}
                        dataKey={'name'}
                        endIndex={12}
                        fill={'transparent'}
                        height={30}
                        padding={{ top: 20 }}
                        stroke={axisStoke}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className={'mt-6 flex items-center justify-center gap-1 text-muted-foreground'}>
                <div className={'hidden sm:block'}>👆 Click to toggle. Hover to highlight</div>
                <div className={'block sm:hidden'}>👆 Tap to toggle. Long-press to highlight</div>
            </div>
        </div>
    )
}

export default FeesChart
