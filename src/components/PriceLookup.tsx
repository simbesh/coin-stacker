'use client'

import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { cn, currencyFormat, exchangeFees, formatExchangeName } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Coin from '@/components/CoinIcon'
import { round } from 'lodash'
import { useLocalStorage, useWindowScroll } from '@uidotdev/usehooks'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import ExchangeIcon from '@/components/ExchangeIcon'
import { PriceHistoryDropdown } from '@/components/price-history-dropdown'
import { PriceQueryParams } from '@/types/types'
import Spinner from '@/components/Spinner'
import { FeeParams } from '@/components/fee-params'
import { LocalStorageKeys } from '@/lib/constants'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const markets = ['BTC', 'ETH', 'SOL', 'XRP', 'LTC', 'ADA', 'DOGE']

type PriceQueryResult = {
    exchange: string
    netPrice: number
    netCost: number
    grossPrice: number
    grossAveragePrice: number
    fees: number
}

const headers = [
    {
        id: 'exchange',
        title: 'Exchange',
        className: 'w-[100px]',
    },
    {
        id: 'price',
        title: 'Avg. Price',
        className: 'text-right',
    },
    {
        id: 'fees',
        title: 'Fees',
        className: 'text-right',
    },
    {
        id: 'total',
        title: 'Total inc fees',
        className: 'text-right',
    },
    {
        id: 'dif',
        title: '+$',
        className: 'text-right',
    },
    {
        id: 'pctDif',
        title: '+%',
        className: 'text-right',
    },
]

const firstRowCellStyle = 'text-green-600 dark:text-green-500'

const PriceLookup = () => {
    const [side, setSide] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState<string>('')
    const [coin, setCoin] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [bests, setBests] = useState<PriceQueryResult[]>([])
    const [resultInput, setResultInput] = useState<PriceQueryParams>()
    const [{}, scrollTo] = useWindowScroll()
    const [history, setHistory] = useLocalStorage<PriceQueryParams[]>(LocalStorageKeys.PriceQueryHistory, [])
    const [fees] = useLocalStorage<Record<string, number>>(LocalStorageKeys.ExchangeFees, exchangeFees)
    const [lowestFee, setLowestFee] = useState<number>()
    const [bestAvgPrice, setBestAvgPrice] = useState<number>()

    useEffect(() => {
        if (bests?.length > 0) {
            const lowestValue = bests.reduce((min, obj) => Math.min(min, obj.fees), Infinity)
            setLowestFee(lowestValue)

            if (side === 'buy') {
                const lowestAvgPrice = bests.reduce((min, obj) => Math.min(min, obj.grossAveragePrice), Infinity)
                setBestAvgPrice(lowestAvgPrice)
            } else {
                const highestAvgPrice = bests.reduce((min, obj) => Math.max(min, obj.grossAveragePrice), -Infinity)
                setBestAvgPrice(highestAvgPrice)
            }
        }
    }, [bests])
    async function getPrices({ side, amount, coin }: PriceQueryParams) {
        if (!amount) {
            return
        }
        const floatAmount = parseFloat(amount)
        if (!side || !floatAmount || !coin) {
            return
        }
        const data = {
            side,
            amount: floatAmount,
            coin,
            query: `${side}_${floatAmount}_${coin}`,
        }
        umami.track('price-lookup', data)

        function addToHistory(data: PriceQueryParams) {
            const exists = history.find((h) => h.coin === data.coin && h.side === data.side && h.amount && data.amount)
            let tempHistory
            if (!exists) {
                tempHistory = [data, ...history]
            } else {
                tempHistory = [
                    data,
                    ...history.filter((h) => h.coin !== data.coin || h.side !== data.side || h.amount !== data.amount),
                ]
            }
            setHistory(tempHistory.slice(0, 6))
        }

        addToHistory({ side, amount, coin })
        setIsLoading(true)
        try {
            const prices = await fetch(`api/price-query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fees,
                    base: coin,
                    quote: 'AUD',
                    side,
                    amount: floatAmount,
                }),
            })
            const { best } = await prices.json()
            setBests(best)
            setResultInput({ side, amount, coin })
        } catch (e) {}
        scrollTo({ top: 9999, left: 0, behavior: 'smooth' })
        setTimeout(() => scrollTo({ top: 9999, left: 0, behavior: 'smooth' }), 300)
        setIsLoading(false)
    }

    function getDif(bests: PriceQueryResult[], i: number): string {
        if (i !== 0) {
            const best = bests[0]
            const current = bests[i]
            let dif = 0
            if (current && best) {
                dif = current.netCost - best.netCost
            }
            return (resultInput?.side === 'buy' ? '+' : '') + currencyFormat(dif)
        }
        return '-'
    }

    function getDifPct(bests: PriceQueryResult[], i: number): string {
        if (i !== 0) {
            const best = bests[0]
            const current = bests[i]
            let pct = 0
            if (current && best) {
                pct = current.netCost / best.netCost - 1
            }
            return (resultInput?.side === 'buy' ? '+' : '-') + round(Math.abs(pct * 100), 2) + '%'
        }
        return '-'
    }

    function handleHistoryClick(data: PriceQueryParams) {
        if (!isLoading) {
            setSide(data.side)
            setAmount(data.amount.toString())
            setCoin(data.coin)
            void getPrices(data)
        }
    }

    return (
        <div className={'mb-16 flex w-full flex-col items-center justify-center'}>
            <Card
                className={
                    'relative mt-8 flex w-full max-w-2xl select-none flex-col items-center justify-center gap-4 border py-8 text-xl font-bold sm:mt-20'
                }
            >
                <PriceHistoryDropdown
                    className={'absolute left-2 top-2 bg-transparent'}
                    raiseHistory={handleHistoryClick}
                />
                <div className={'absolute right-2 top-2 flex gap-2'}>
                    <Button variant="outline" className={'bg-transparent px-2'} disabled>
                        {'AUD'}
                    </Button>
                    <FeeParams />
                </div>
                {'I want to...'}
                <div>
                    <Button
                        variant={'secondary'}
                        className={cn(
                            side === 'buy'
                                ? 'bg-green-200 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                                : 'border hover:border-green-500 hover:text-green-500',
                            'w-24 rounded-r-none text-lg '
                        )}
                        onClick={() => setSide('buy')}
                    >
                        Buy
                    </Button>
                    <Button
                        variant={'secondary'}
                        className={cn(
                            side === 'sell'
                                ? 'bg-red-200 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                                : 'border hover:border-red-500 hover:text-red-500',
                            'w-24 rounded-l-none text-lg'
                        )}
                        onClick={() => setSide('sell')}
                    >
                        Sell
                    </Button>
                </div>
                <div className={'flex gap-2'}>
                    <Input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type={'number'}
                        className={'w-40 text-right text-lg ring-0 focus-visible:ring-0'}
                    />
                    <Select onValueChange={setCoin} value={coin}>
                        <SelectTrigger id="volumeFrom" className="w-[160px] text-lg">
                            <SelectValue placeholder="Coin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {markets.map((market) => (
                                    <SelectItem value={market}>
                                        <div className={'flex items-center gap-2 text-lg font-semibold'}>
                                            <Coin symbol={market} />
                                            {market}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className={'flex w-full justify-center'}>
                    <Button
                        variant={'default'}
                        className={'mx-2 mt-4 w-full rounded-lg text-base text-black sm:mx-4 sm:w-28'}
                        onClick={() => getPrices({ side, amount, coin })}
                        disabled={!side || !amount || !coin || isLoading}
                    >
                        {isLoading ? <Spinner /> : <>{'Find'}</>}
                    </Button>
                </div>
            </Card>
            <Card className={'relative mb-20 mt-10 w-full max-w-4xl sm:my-10'}>
                {isLoading && bests.length > 0 && (
                    <div className="absolute inset-0 z-50 bg-slate-300/30 dark:bg-slate-700/30">
                        <div className="flex h-full w-full items-center justify-center">
                            <div className={'rounded-md bg-slate-50 p-3 dark:bg-slate-950'}>
                                <Spinner className={'h-8 w-8 opacity-100'} />
                            </div>
                        </div>
                    </div>
                )}
                <Table>
                    {bests.length === 0 && <TableCaption className={'mb-4'}>{'No Data'}</TableCaption>}
                    <TableHeader>
                        <TableRow className={'hover:bg-muted/0'}>
                            {headers.map((header) => (
                                <TableHead key={header.id} className={cn(header.className)}>
                                    {header.title}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className={cn('font-semibold', isLoading && 'opacity-40')}>
                        {bests.map((best, i) => (
                            <TableRow key={best.exchange} className={cn(i === 0 && 'border-2 border-green-500')}>
                                <TableCell
                                    className={cn(
                                        'mr-2 flex items-center justify-start gap-2 whitespace-nowrap text-left',
                                        i === 0 ? firstRowCellStyle : ''
                                    )}
                                >
                                    <ExchangeIcon exchange={best.exchange} />
                                    {formatExchangeName(best.exchange)}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        'text-right',
                                        bestAvgPrice === best.grossAveragePrice ? 'text-green-500' : ''
                                    )}
                                >
                                    {currencyFormat(best?.grossAveragePrice, 'AUD', best.grossAveragePrice < 5 ? 4 : 2)}
                                </TableCell>
                                <TableCell
                                    className={cn('text-right', lowestFee === best.fees ? 'text-green-500' : '')}
                                >
                                    <Popover>
                                        <PopoverTrigger
                                            className={'cursor-help underline decoration-dashed underline-offset-2'}
                                        >
                                            {currencyFormat(best?.fees)}
                                        </PopoverTrigger>
                                        <PopoverContent className={'w-fit p-2 text-sm'}>
                                            <p>
                                                {formatExchangeName(best.exchange)} fee:{' '}
                                                {round((fees[best.exchange] ?? 0) * 100, 2) + '%'}
                                            </p>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell className={cn('text-right', i === 0 ? firstRowCellStyle : '')}>
                                    {currencyFormat(best.netCost)}
                                </TableCell>
                                <TableCell className={cn('text-right', i === 0 ? 'text-white' : 'text-red-500')}>
                                    {getDif(bests, i)}
                                </TableCell>
                                <TableCell className={cn('text-right', i === 0 ? 'text-white' : 'text-red-500')}>
                                    {getDifPct(bests, i)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

export default PriceLookup