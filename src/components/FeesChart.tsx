"use client"
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react"
import {Area, AreaChart, Brush, Legend, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis} from "recharts"
import {cn, currencyFormat} from "@/lib/utils"
import {useZoomAndPan} from "@/hooks/useZoomAndPan"
import {useTheme} from "next-themes";

const strokeWidth = 1.5
let ir = [
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
    [200000000, 0.02]
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
    [5000000, 0.13]
]
const cj = [
    [0, 0.1],
    [100_000, 0.1],
    [400_000, 0.1],
    [1_000_000, 0.08],
    [10_000_000, 0.06]
]
const cs = [
    [0, 0.1],
    [200_000_000, 0.1]
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
    [500000000, 0.04]
]
// const kr = [
//     [0, 0.26],
//     [50001, 0.24],
//     [100001, 0.22],
//     [250001, 0.2],
//     [500001, 0.18],
//     [1000001, 0.16],
//     [2500001, 0.14],
//     [5000001, 0.12],
//     [10000001, 0.1],
//     [100000000, 0.08],
//     [250000000, 0.06],
//     [500000000, 0.04]
// ]
const ln = [
    [0, 0.1],
    [350000, 0.09],
    [700000, 0.08],
    [1_400_000, 0.07],
    [2_800_000, 0.06],
    [5_600_000, 0.05],
    [8_400_000, 0.04],
    [11_200_000, 0.03]
]

// let data = [
//     { name: "Page A", uv: 4000, xx: 3300 },
//     { name: "Page B", uv: 3000, xx: 3000 },
//     { name: "Page C", uv: 2000 },
//     { name: "Page D" },
//     { name: "Page E", uv: 1890 },
//     { name: "Page F", uv: 2390, xx: 3400 },
//     { name: "Page G", uv: 3490, xx: 3700 }
// ]
let dataMap: any = {}
for (let i of ir) {
    if (!dataMap[i[0]!]) {
        dataMap[i[0]!] = {name: i[0]}
    }
    dataMap[i[0]!].IndepRes = i[1]
}
for (let i of btcm) {
    if (!dataMap[i[0]!]) {
        dataMap[i[0]!] = {name: i[0]}
    }
    dataMap[i[0]!].BtcMarkets = i[1]
}
for (let i of cj) {
    if (!dataMap[i[0]!]) {
        dataMap[i[0]!] = {name: i[0]}
    }
    dataMap[i[0]!].CoinJar = i[1]
}
for (let i of cs) {
    if (!dataMap[i[0]!]) {
        dataMap[i[0]!] = {name: i[0]}
    }
    dataMap[i[0]!].CoinSpot = i[1]
}
for (let i of kr) {
    if (!dataMap[i[0]!]) {
        dataMap[i[0]!] = {name: i[0]}
    }
    dataMap[i[0]!].Kraken = i[1]
}
for (let i of ln) {
    if (!dataMap[i[0]!]) {
        dataMap[i[0]!] = {name: i[0]}
    }
    dataMap[i[0]!].Luno = i[1]
}
let data: any[] = []
let prev: any

Object.keys(dataMap)
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .forEach((key) => {
        const value = dataMap[key]
        if (!prev) {
            prev = value
        }
        let missing = Object.keys(prev).filter((v) => !Object.keys(value).includes(v))
        missing.forEach((v) => (value[v] = prev[v]))
        const dataPoint = {...value}
        dataPoint.value = dataPoint.name
        dataPoint.name = currencyFormat(dataPoint.name, "AUD", 0)
        data.push(dataPoint)
        Object.keys(value).forEach((v) => {
            prev[v] = value[v]
        })
    })


const selectOptions = data.map(x => ({label: x.name, value: x.value.toString()}))
const allData = data
// const defaultFrom = '0'
// const defaultTo = '500000000'
const axisStoke = '#4d5784'
// const axisStoke = '#3d4468'
const Example = () => {
    const [loaded, setLoaded] = useState(false)
    // const [data, setData] = useState(allData)
    // const [volumeFrom, setVolumeFrom] = useState(defaultFrom)
    // const [volumeTo, setVolumeTo] = useState(defaultTo)
    const {clipPathRefs, xPadding, onChartMouseDown, onChartMouseUp, setWrapperRef, onChartMouseMove} = useZoomAndPan(
        {
            chartLoaded: loaded
        }
    )

    const {theme} = useTheme()

    useEffect(() => {
        setTimeout(() => {
            setLoaded(true)
        }, 100)
    }, [])


    // console.log("process.env.GIT_HASH", process.env.GIT_HASH)

    const CustomTooltip = (props: TooltipProps<any, any>) => {
        const {active, payload, label} = props
        if (active && payload && payload.length) {
            return (
                <div className={cn(theme === 'light' ? " bg-white" : "bg-slate-900", "w-80 p-2 pl-4 rounded-md")}>
                    <p className="label">{`AUD Volume: ${label} `}</p>
                    <div className={"grid grid-cols-2"}>
                        {payload.map((line) => (
                            <div
                                className={"font-bold"}
                                style={{color: line.stroke}}>{`${line.name}: ${line.value}%`}</div>
                        ))}
                    </div>
                </div>
            )
        }

        return null
    }
    const RechartsClipPaths = forwardRef((_, ref: React.ForwardedRef<any>) => {
        const grid = useRef<SVGRectElement>(null)
        const axis = useRef<SVGRectElement>(null)
        useImperativeHandle(ref, () => ({
            grid,
            axis
        }))

        return (
            <>
                <clipPath id="chart-xaxis-clip">
                    <rect fill="rgba(0,0,0,0)" height="100%" ref={axis}/>
                </clipPath>
                <clipPath id="chart-grid-clip">
                    <rect fill="rgba(0,0,0,0)" height="100%" ref={grid}/>
                </clipPath>
            </>
        )
    })


    return (
        <div style={{width: "100%"}}>
            {/*<div className="w-full justify-center flex gap-2 items-center">*/}
            {/*    <Label htmlFor="volumeFrom">Volume From</Label>*/}
            {/*    <Select defaultValue={defaultFrom} onValueChange={setVolumeFrom} value={volumeFrom}>*/}
            {/*        <SelectTrigger id="volumeFrom" className="w-[120px]">*/}
            {/*            <SelectValue placeholder="From Volume"/>*/}
            {/*        </SelectTrigger>*/}
            {/*        <SelectContent>*/}
            {/*            <SelectGroup>*/}
            {/*                {selectOptions.map(o => (*/}
            {/*                    <SelectItem value={o.value}>{o.label}</SelectItem>*/}
            {/*                ))}*/}
            {/*            </SelectGroup>*/}
            {/*        </SelectContent>*/}
            {/*    </Select>*/}
            {/*    <Label htmlFor="volumeTo">Volume To</Label>*/}
            {/*    <Select defaultValue={defaultTo} onValueChange={setVolumeTo} value={volumeTo}>*/}
            {/*        <SelectTrigger id="volumeTo" className="w-[120px]">*/}
            {/*            <SelectValue placeholder="To Volume"/>*/}
            {/*        </SelectTrigger>*/}
            {/*        <SelectContent>*/}
            {/*            <SelectGroup>*/}
            {/*                {selectOptions.map(o => (*/}
            {/*                    <SelectItem value={o.value}>{o.label}</SelectItem>*/}
            {/*                ))}*/}
            {/*            </SelectGroup>*/}
            {/*        </SelectContent>*/}
            {/*    </Select>*/}
            {/*</div>*/}
            <ResponsiveContainer width="95%" height={500} debounce={100} ref={setWrapperRef}>
                <AreaChart
                    width={500}
                    height={200}
                    data={allData}
                    onMouseMove={onChartMouseMove}
                    onMouseDown={onChartMouseDown}
                    onMouseUp={onChartMouseUp}
                    margin={{
                        top: 75,
                        right: 30,
                        left: 0,
                        bottom: 0
                    }}>
                    <defs>
                        <RechartsClipPaths ref={clipPathRefs}/>
                        <linearGradient id="colorBTCM" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#51e491" stopOpacity={0.35}/>
                            <stop offset="35%" stopColor="#51e491" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCJ" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff9719" stopOpacity={0.35}/>
                            <stop offset="65%" stopColor="#ff9719" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorIR" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4974ff" stopOpacity={0.35}/>
                            <stop offset="35%" stopColor="#4974ff" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorKR" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9482ff" stopOpacity={0.35}/>
                            <stop offset="35%" stopColor="#9482ff" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCS" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4f4f" stopOpacity={0.35}/>
                            <stop offset="65%" stopColor="#ec4f4f" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLU" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2639f2" stopOpacity={0.35}/>
                            <stop offset="65%" stopColor="#2639f2" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    {/*<CartesianGrid strokeDasharray="3 3" />*/}
                    <XAxis
                        dataKey="name"
                        padding={{left: xPadding[0], right: xPadding[1]}}
                        allowDataOverflow={true}
                        stroke={axisStoke}
                    />
                    <YAxis
                        stroke={axisStoke}/>
                    <Legend/>
                    {/*<Legend content={renderLegend}/>*/}
                    <Tooltip
                        content={CustomTooltip}
                        formatter={(value, name, props) => {
                            return [value + "%", name]
                        }}
                        position={{x: 75, y: 0}}
                        contentStyle={{
                            fontWeight: "bold",
                            // backgroundColor: tierBackgroundColor,
                            // backgroundColor: "#0f182c",
                            // color: 'white',
                            minWidth: "11rem",
                            borderColor: "transparent",
                            borderRadius: "10px"
                        }}
                    />
                    <Area
                        connectNulls
                        dot={false}
                        strokeWidth={strokeWidth}
                        type="stepAfter"
                        dataKey="BtcMarkets"
                        stroke="#51e491"
                        fill="url(#colorBTCM)"
                    />
                    <Area
                        connectNulls
                        dot={false}
                        strokeWidth={strokeWidth}
                        type="stepAfter"
                        dataKey="IndepRes"
                        stroke="#4974ff"
                        fill="url(#colorIR)"
                    />
                    <Area
                        connectNulls
                        dot={false}
                        strokeWidth={strokeWidth}
                        type="stepAfter"
                        dataKey="Kraken"
                        stroke="#9482ff"
                        fill="url(#colorKR)"
                    />
                    <Area
                        connectNulls
                        dot={false}
                        strokeWidth={strokeWidth}
                        type="stepAfter"
                        dataKey="CoinJar"
                        stroke="#ff9719"
                        fill="url(#colorCJ)"
                    />
                    <Area
                        connectNulls
                        dot={false}
                        strokeWidth={strokeWidth}
                        type="stepAfter"
                        dataKey="CoinSpot"
                        stroke="#ec4f4f"
                        fill="url(#colorCS)"
                        strokeDasharray="30 15"
                    />
                    <Area
                        connectNulls
                        dot={false}
                        strokeWidth={strokeWidth}
                        type="stepAfter"
                        dataKey="Luno"
                        stroke="#2639f2"
                        fill="url(#colorLU)"
                        strokeDasharray="15 30"
                    />
                    <Brush fill={'transparent'} stroke={axisStoke} endIndex={12} height={30} data={allData} dataKey={'name'}/>

                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default Example
