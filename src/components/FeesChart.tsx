'use client'

import React, { useState } from 'react'
import { Area, AreaChart, Brush, Legend, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts'
import { cn, currencyFormat, defaultEnabledExchanges } from '@/lib/utils'
import { useLocalStorage } from '@uidotdev/usehooks'
import { LocalStorageKeys } from '@/lib/constants'

const strokeWidth = 1.5
const ir = [
    [0, 0.5],
    [50000, 0.48],
    [100000, 0.46],
    [200000, 0.44],
    [300000, 0.42],
    [400000, 0.4],
    [500000, 0.38],
    [600000, 0.36],
    [800000, 0.34],
    [1000000, 0.32],
    [1200000, 0.3],
    [1400000, 0.28],
    [1600000, 0.26],
    [1800000, 0.24],
    [2000000, 0.22],
    [2500000, 0.2],
    [3000000, 0.18],
    [3500000, 0.16],
    [4000000, 0.14],
    [4500000, 0.12],
    [5000000, 0.1],
    [10000000, 0.08],
    [15000000, 0.07],
    [30000000, 0.06],
    [50000000, 0.05],
    [100000000, 0.04],
    [150000000, 0.03],
    [200000000, 0.02],
]

const btcm = [
    [0, 0.85],
    [500, 0.83],
    [1000, 0.8],
    [3000, 0.75],
    [9000, 0.7],
    [18000, 0.65],
    [40000, 0.6],
    [60000, 0.55],
    [70000, 0.5],
    [80000, 0.45],
    [90000, 0.4],
    [115000, 0.35],
    [125000, 0.3],
    [200000, 0.25],
    [400000, 0.23],
    [650000, 0.2],
    [850000, 0.18],
    [1000000, 0.15],
    [3000000, 0.13],
    [5000000, 0.13],
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
    [0, 0.26],
    [50000, 0.24],
    [100000, 0.22],
    [250000, 0.2],
    [500000, 0.18],
    [1000000, 0.16],
    [2500000, 0.14],
    [5000000, 0.12],
    [10000000, 0.1],
    [100000000, 0.08],
    [250000000, 0.06],
    [500000000, 0.04],
]
const ln = [
    [0, 0.1],
    [350000, 0.09],
    [700000, 0.08],
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

function fillDataPoints(dataMap: Record<string, Record<string, number>>, data: number[][], key: string) {
    for (const i of data) {
        if (i[0] !== undefined && i[1] !== undefined) {
            if (!dataMap[i[0]]) {
                dataMap[i[0]] = { name: i[0] }
            }
            dataMap[i[0]]![key] = i[1]
        }
    }
}

const dataMap: Record<string, Record<string, number>> = {}
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

const data: any[] = []
let prev: any
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
]

Object.keys(dataMap)
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .forEach((key) => {
        const value = dataMap[key]
        if (value !== undefined && value.name !== undefined) {
            if (!prev) {
                prev = value
            }
            const missing = Object.keys(prev).filter((v) => !Object.keys(value).includes(v))
            missing.forEach((v) => (value[v] = prev[v]))
            const dataPoint: Record<string, string | number> = { ...value }
            dataPoint.value = value.name
            dataPoint.name = currencyFormat(value.name, 'AUD', 0)
            data.push(dataPoint)
            Object.keys(value).forEach((v) => {
                prev[v] = value[v]
            })
        }
    })

const allData = data
const axisStoke = '#4d5784'
const FeesChart = () => {
    const [labels, setLabels] = useState(allLabels)
    const [enabledExchanges] = useLocalStorage<Record<string, boolean>>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges
    )
    const [seriesProps, setSeriesProps] = useState<Record<string, string | undefined | boolean>>(
        labels.reduce(
            (a: Record<string, undefined>, { key }: { key: string }) => {
                a[key] = undefined
                return a
            },
            { hover: undefined }
        )
    )

    const handleLegendMouseEnter = (e: any) => {
        navigator.vibrate(75)
        if (!seriesProps[e.dataKey]) {
            setSeriesProps({ ...seriesProps, hover: e.dataKey })
        }
    }

    const handleLegendMouseLeave = () => {
        setSeriesProps({ ...seriesProps, hover: undefined })
    }

    const selectSeries = (e: any) => {
        setSeriesProps({
            ...seriesProps,
            [e.dataKey]: !seriesProps[e.dataKey],
            hover: undefined,
        })
    }

    const CustomTooltip = (props: TooltipProps<any, any>) => {
        const { active, payload, label } = props
        if (active && payload && payload.length) {
            return (
                <div className={cn('bg-card w-80 rounded-md p-2 pl-4')}>
                    <p className="label">{`AUD Volume: ${label} `}</p>
                    <div className={'grid grid-cols-2'}>
                        {payload.map((line) => (
                            <div
                                className={'font-bold'}
                                style={{ color: line.stroke }}
                            >{`${line.name}: ${line.value}%`}</div>
                        ))}
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <div className={'w-full'}>
            <ResponsiveContainer width="100%" height={500} debounce={100}>
                <AreaChart
                    width={500}
                    height={200}
                    data={allData}
                    margin={{
                        top: 75,
                        right: 20,
                        left: -15,
                        bottom: 0,
                    }}
                >
                    <defs>
                        {labels.map(({ colour, gradientKey, gradientStop }) => (
                            <linearGradient id={gradientKey} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colour} stopOpacity={0.35} />
                                <stop offset={gradientStop} stopColor={colour} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <XAxis dataKey="name" allowDataOverflow={true} stroke={axisStoke} />
                    <YAxis stroke={axisStoke} />
                    <Legend
                        wrapperStyle={{
                            left: 0,
                            bottom: 0,
                            paddingTop: 16,
                            userSelect: 'none',
                        }}
                        onClick={selectSeries}
                        onMouseOver={handleLegendMouseEnter}
                        onMouseOut={handleLegendMouseLeave}
                    />
                    <Tooltip
                        content={CustomTooltip}
                        formatter={(value, name) => {
                            return [value + '%', name]
                        }}
                        position={{ x: 75, y: 0 }}
                        contentStyle={{
                            fontWeight: 'bold',
                            minWidth: '11rem',
                            borderColor: 'transparent',
                            borderRadius: '10px',
                        }}
                    />
                    {labels.map(({ colour, gradientKey, key, strokeDasharray, exchange }) => (
                        <>
                            {enabledExchanges[exchange] && (
                                <Area
                                    connectNulls
                                    dot={false}
                                    strokeWidth={strokeWidth}
                                    type="stepAfter"
                                    dataKey={key}
                                    stroke={colour}
                                    fill={`url(#${gradientKey})`}
                                    hide={seriesProps[key] === true}
                                    fillOpacity={Number(seriesProps.hover === key || !seriesProps.hover ? 0.65 : 0.05)}
                                    strokeOpacity={Number(seriesProps.hover === key || !seriesProps.hover ? 1 : 0.3)}
                                    strokeDasharray={strokeDasharray}
                                />
                            )}
                        </>
                    ))}
                    <Brush
                        fill={'transparent'}
                        stroke={axisStoke}
                        endIndex={12}
                        height={30}
                        data={allData}
                        dataKey={'name'}
                        padding={{ top: 20 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className={'text-muted-foreground mt-6 flex items-center justify-center gap-1'}>
                <div className={'hidden sm:block'}>👆 Click to toggle. Hover to highlight</div>
                <div className={'block sm:hidden'}>👆 Tap to toggle. Long-press to highlight</div>
            </div>
        </div>
    )
}

export default FeesChart
