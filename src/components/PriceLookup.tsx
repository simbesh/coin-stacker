'use client'

import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { cn, currencyFormat, defaultEnabledExchanges, exchangeFees, formatExchangeName } from '@/lib/utils'
import { Input } from '@/components/ui/input'
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
import { tradeUrl, LocalStorageKeys, affiliateUrl } from '@/lib/constants'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CornerLeftUp, ExternalLink } from 'lucide-react'
import { Combobox } from '@/components/Combobox'
import posthog from 'posthog-js'
import useMutableSearchParams from '@/hooks/useMutableSearchParams'
import { CoinSpotInfoAlert } from './CoinSpotInfoAlert'

const markets = [
    'BTC',
    'ETH',
    'SOL',
    'XRP',
    'ADA',
    'LTC',
    'DOGE',
    ...[
        'USDT',
        'LINK',
        'USDC',
        'AAVE',
        'BAT',
        'BCH',
        'COMP',
        'DOT',
        'SAND',
        'UNI',
        'XLM',
        'EOS',
        'MATIC',
        'ALGO',
        'AVAX',
        'ENJ',
        'ETC',
        'MANA',
        'OMG',
        'POWR',
        'DAI',
        'GRT',
        'MKR',
        'SNX',
        'YFI',
        'ZRX',
        'EUR',
        'XTZ',
    ].sort(),
]

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
interface QueryParams {
    coin: string
    side: string
    amount: string
}

const firstRowCellStyle = 'text-green-600 dark:text-green-500'

const PriceLookup = () => {
    const [side, setSide] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState<string>('')
    const [coin, setCoin] = useState<string>('')
    const [quote, setQuote] = useState<string>('AUD')
    const [isLoading, setIsLoading] = useState(false)
    const [bests, setBests] = useState<PriceQueryResult[]>([])
    const [resultInput, setResultInput] = useState<PriceQueryParams>()
    const [{}, scrollTo] = useWindowScroll()
    const [history, setHistory] = useLocalStorage<PriceQueryParams[]>(LocalStorageKeys.PriceQueryHistory, [])
    const [fees] = useLocalStorage<Record<string, number>>(LocalStorageKeys.ExchangeFees, exchangeFees)
    const [lowestFee, setLowestFee] = useState<number>()
    const [bestAvgPrice, setBestAvgPrice] = useState<number>()
    const [enabledExchanges] = useLocalStorage<Record<string, boolean>>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges
    )
    const { searchParams, setSearchParams } = useMutableSearchParams<QueryParams>()

    useEffect(() => {
        const coin = searchParams.get('coin')
        const side = searchParams.get('side')
        const amount = searchParams.get('amount')
        if (coin) {
            setCoin(coin)
        }
        if (side && (side === 'buy' || side === 'sell')) {
            setSide(side)
        }
        if (amount) {
            setAmount(amount)
        }
        if (coin !== null && side !== null && amount !== null) {
            getPrices({ side: side as 'buy' | 'sell', amount, coin })
        }
    }, [])

    useEffect(() => {
        setSearchParams({ side, amount, coin })
    }, [side, amount, coin])

    useEffect(() => {
        if (bests.length > 0) {
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
        if (!floatAmount || !coin) {
            return
        }
        const data = {
            side,
            amount: floatAmount,
            coin,
        }
        posthog.capture('price-lookup', data)

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

        addToHistory({ quote, side, amount, coin })
        setIsLoading(true)
        try {
            const prices = await fetch(`api/price-query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fees,
                    base: coin,
                    quote,
                    side,
                    amount: floatAmount,
                    omitExchanges: Object.entries(enabledExchanges).reduce((acc: string[], [key, value]) => {
                        if (!value) {
                            acc.push(key)
                        }
                        return acc
                    }, []),
                }),
            })
            const { best } = await prices.json()

            setBests(best)
            setResultInput({ side, amount, coin, quote })
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

    const resultsReady = bests.length > 0 && resultInput

    return (
        <div className={'mb-16 flex w-full flex-col items-center justify-center'}>
            <Card
                className={
                    'relative mb-4 mt-8 flex w-full max-w-2xl select-none flex-col items-center justify-center gap-4 border py-8 text-lg font-bold sm:mt-20'
                }
            >
                <PriceHistoryDropdown
                    className={'absolute left-2 top-2 bg-transparent'}
                    raiseHistory={handleHistoryClick}
                />
                <div className={'absolute right-2 top-2 flex gap-2'}>
                    <Combobox
                        className={'bg-card w-20'}
                        optionType={'Quote'}
                        value={quote}
                        setValue={setQuote}
                        options={['AUD', 'USD', 'USDT', 'USDC'].map((q) => ({
                            value: q,
                            label: <div className={'flex items-center gap-2 text-lg font-semibold'}>{q}</div>,
                        }))}
                    />
                    <FeeParams />
                </div>
                {'I want to...'}
                <div>
                    <Button
                        variant={'secondary'}
                        className={cn(
                            side === 'buy'
                                ? 'bg-green-200 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                                : 'bg-card border text-slate-400 hover:border-green-500 hover:text-green-500 dark:text-slate-600 hover:dark:text-green-500',
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
                                : 'bg-card border text-slate-400 hover:border-red-500 hover:text-red-500 dark:text-slate-600 hover:dark:text-red-500',
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
                    <Combobox
                        className={'bg-card w-[160px]'}
                        optionType={'Coin'}
                        value={coin}
                        setValue={setCoin}
                        options={markets.map((market) => ({
                            value: market,
                            label: (
                                <div className={'flex items-center gap-2 text-lg font-semibold'}>
                                    <Coin symbol={market} />
                                    {market}
                                </div>
                            ),
                        }))}
                    />
                </div>
                <div className={'flex w-full justify-center'}>
                    <Button
                        variant={'default'}
                        className={'mx-4 mt-4 w-full rounded-lg text-base text-black sm:w-44'}
                        onClick={() => getPrices({ side, amount, coin })}
                        disabled={!amount || !coin || isLoading}
                        isLoading={isLoading}
                    >
                        Search
                    </Button>
                </div>
            </Card>
            {(coin === 'SOL' || (resultInput?.coin === 'SOL' && !isLoading)) && <CoinSpotInfoAlert />}
            <div
                className={cn(
                    'mt-4 flex h-6 w-full items-center justify-center text-sm font-bold',
                    isLoading && 'opacity-30'
                )}
            >
                {resultsReady && (
                    <>
                        <div
                            className={cn(
                                'bg-card flex items-center gap-2 rounded-t-md border px-2 capitalize ',
                                resultInput.side === 'buy' ? 'border-green-800' : 'border-red-800'
                            )}
                        >
                            <div
                                className={cn(
                                    resultInput.side === 'buy'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                )}
                            >
                                {resultInput.side}
                            </div>
                            <div>{resultInput.amount}</div>
                            <Coin symbol={resultInput.coin} className={'size-6'} />
                            <div>{resultInput.coin}</div>
                        </div>
                    </>
                )}
            </div>
            <Card className={'relative !mb-0 w-full max-w-4xl'}>
                {isLoading && bests.length > 0 && (
                    <div className="absolute inset-0 z-50">
                        <div className="flex size-full items-center justify-center">
                            <div className={'border-accent rounded-md border bg-slate-50 p-5 dark:bg-slate-950'}>
                                <Spinner className={'size-10 opacity-100'} />
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
                                    {header.title === 'Fees' && resultInput?.quote && ` (${resultInput.quote})`}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className={cn('font-semibold', isLoading && 'opacity-30')}>
                        {bests.map((best, i) => (
                            <TableRow
                                key={best.exchange + '_' + i}
                                className={cn(i === 0 && 'border-2 border-green-500')}
                            >
                                <TableCell
                                    className={cn(
                                        'mr-2 flex size-full items-center justify-start gap-2 whitespace-nowrap p-0 text-left sm:p-0',
                                        i === 0 ? firstRowCellStyle : ''
                                    )}
                                >
                                    <a
                                        href={
                                            affiliateUrl(best.exchange, coin, quote) ??
                                            tradeUrl(best.exchange, coin, quote)
                                        }
                                        target={'_blank'}
                                        className={
                                            'flex size-full items-center justify-start gap-1 p-2 hover:text-amber-600 hover:underline sm:gap-2 sm:p-4 dark:hover:text-amber-400'
                                        }
                                    >
                                        <ExchangeIcon exchange={best.exchange} withLabel />
                                        <ExternalLink className={'size-4 min-h-[1rem] min-w-[1rem]'} />
                                    </a>
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        'text-right',
                                        bestAvgPrice === best.grossAveragePrice ? 'text-green-500' : ''
                                    )}
                                >
                                    {currencyFormat(best.grossAveragePrice, 'AUD', best.grossAveragePrice < 5 ? 4 : 2)}
                                </TableCell>
                                <TableCell
                                    className={cn('text-right', lowestFee === best.fees ? 'text-green-500' : '')}
                                >
                                    <Popover>
                                        <PopoverTrigger
                                            className={'cursor-help underline decoration-dashed underline-offset-2'}
                                        >
                                            {currencyFormat(best.fees)}
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
            {bests.length > 0 && (
                <div className={'w-full max-w-4xl pl-4 text-sm leading-4 text-slate-400 sm:pl-12 dark:text-slate-600'}>
                    <span className={'mt-2 flex items-start justify-start gap-1'}>
                        <CornerLeftUp className={'size-4'} />
                        Want to support CoinStacker?
                    </span>
                    <span className={'flex justify-start gap-2'}>
                        Sign up to a new exchange using the referral links above.
                    </span>
                    <a
                        className={
                            'flex w-40 justify-start gap-2 text-slate-400 underline underline-offset-4 hover:text-amber-600 dark:text-slate-400 dark:dark:hover:text-amber-400'
                        }
                        href={'https://ko-fi.com/simonbechard'}
                    >
                        or buy us a coffee! ☕
                    </a>
                </div>
            )}
        </div>
    )
}

export default PriceLookup
