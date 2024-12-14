'use client'

import Coin from '@/components/CoinIcon'
import { Combobox } from '@/components/Combobox'
import ExchangeIcon from '@/components/ExchangeIcon'
import Spinner from '@/components/Spinner'
import { FeeParams } from '@/components/fee-params'
import { PriceHistoryDropdown } from '@/components/price-history-dropdown'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAfiliateOrTradeUrl, LocalStorageKeys } from '@/lib/constants'
import {
    cn,
    currencyFormat,
    defaultEnabledExchanges,
    defaultExchangeFees,
    formatExchangeName,
    getExchangeUrl,
    OLD_KRAKEN_TAKER_FEE,
} from '@/lib/utils'
import { PriceQueryParams } from '@/types/types'
import { useLocalStorage, useMediaQuery, useWindowScroll } from '@uidotdev/usehooks'
import { round } from 'lodash'
import { CornerLeftUp, ExternalLink, Search, TrendingUp } from 'lucide-react'
import { useQueryState } from 'nuqs'
import posthog from 'posthog-js'
import { useEffect, useMemo, useState } from 'react'
import { PriceCalculationInfoAlert } from './PriceCalculationInfoAlert'
import TextSwitch from './TextSwitch'
import { Button } from './ui/button'
import HowDialog from './HowDialog'

const mockData: any = {
    best: [
        {
            exchange: 'independentreserve',
            netCost: 3675.0890249999998,
            grossPrice: 365.6805,
            netPrice: 367.5089025,
            grossAveragePrice: 365.6805,
            fees: 18.284025,
            feeRate: 0.005,
        },
        {
            exchange: 'kraken',
            netCost: 3676.8488,
            grossPrice: 366.22,
            netPrice: 367.68488,
            grossAveragePrice: 366.22,
            fees: 14.648800000000001,
            feeRate: 0.004,
        },
        {
            exchange: 'coinjar',
            netCost: 3687.54386,
            grossPrice: 368.4,
            netPrice: 368.76839999999993,
            grossAveragePrice: 368.386,
            fees: 3.68386,
            feeRate: 0.001,
        },
        {
            exchange: 'btcmarkets',
            netCost: 3694.1355,
            grossPrice: 366.3,
            netPrice: 369.41355,
            grossAveragePrice: 366.3,
            fees: 31.135500000000004,
            feeRate: 0.0085,
        },
        {
            exchange: 'coinspot',
            netCost: 3699.721217192,
            grossPrice: 369.6025192,
            netPrice: 369.9721217192,
            grossAveragePrice: 369.6025192,
            fees: 3.696025192,
            feeRate: 0.001,
        },
        {
            exchange: 'digitalsurge',
            netCost: 3705.6873720603903,
            grossPrice: '368.7251116478',
            netPrice: 370.568737206039,
            grossAveragePrice: 368.7251116478,
            fees: 18.43625558239,
            feeRate: 0.005,
        },
        {
            exchange: 'cointree',
            netCost: 3718.50433359925,
            grossPrice: 369.08231599,
            netPrice: 371.85043335992503,
            grossAveragePrice: 369.08231599,
            fees: 27.68117369925,
            feeRate: 0.0075,
        },
        {
            exchange: 'swyftx',
            netCost: 3719.1401398375365,
            grossPrice: 369.69583895005337,
            netPrice: 371.9140139837537,
            grossAveragePrice: 369.69583895005337,
            fees: 22.1817503370032,
            feeRate: 0.006,
        },
        {
            exchange: 'coinstash',
            netCost: 3725.189443171356,
            grossPrice: 369.3792209391528,
            netPrice: 372.51894431713555,
            grossAveragePrice: 369.3792209391528,
            fees: 31.39723377982799,
            feeRate: 0.0085,
        },
    ],
    errors: [
        {
            name: 'okx',
            error: 'MarketNotFoundError: Symbol SOL/AUD not found in okx',
        },
    ],
}

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
    feeRate: number
}

const headers = [
    {
        id: 'exchange',
        title: 'Exchange',
        className: 'min-w-[160px]',
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
const quickSelectCoins = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT']

const PriceLookup = () => {
    const [side, setSide] = useQueryState<'buy' | 'sell'>('side', {
        defaultValue: 'buy',
        parse: (value: string): 'buy' | 'sell' => (value === 'buy' || value === 'sell' ? value : 'buy'),
    })
    const [hideFiltered, setHideFiltered] = useState(true)
    const [amount, setAmount] = useQueryState('amount', { defaultValue: '' })
    const [coin, setCoin] = useQueryState('coin', { defaultValue: '' })
    const [quote, setQuote] = useQueryState('quote', { defaultValue: 'AUD' })
    const [isLoading, setIsLoading] = useState(false)
    const [priceQueryResult, setPriceQueryResult] = useState<{
        best: PriceQueryResult[]
        errors: { name: string; error: { name?: string } }[]
    }>({ best: [], errors: [] })
    const [resultInput, setResultInput] = useState<PriceQueryParams>()
    const [{}, scrollTo] = useWindowScroll()
    const [history, setHistory] = useLocalStorage<PriceQueryParams[]>(LocalStorageKeys.PriceQueryHistory, [])
    const [fees, setFees] = useLocalStorage<Record<string, number>>(LocalStorageKeys.ExchangeFees, defaultExchangeFees)
    const [bestAvgPrice, setBestAvgPrice] = useState<number>()
    const [tableData, setTableData] = useState<
        (PriceQueryResult & { dif: string; pctDif: string | number; filteredReason?: string })[]
    >([])
    const [enabledExchanges] = useLocalStorage<Record<string, boolean>>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges
    )
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !submitDisabled) {
            getPrices({ side, amount, coin })
        }
    }

    useEffect(() => {
        window.addEventListener('keypress', handleKeyPress)
        return () => {
            window.removeEventListener('keypress', handleKeyPress)
        }
    }, [coin, amount, side])

    useEffect(() => {
        if (coin && amount) {
            getPrices({ side, amount, coin })
        }
    }, [])

    useEffect(() => {
        const newFees = { ...fees }
        if (newFees.kraken === OLD_KRAKEN_TAKER_FEE) {
            // reset fee to new rate
            newFees.kraken = Number(defaultExchangeFees.kraken)
            setFees(newFees)
        }
    }, [fees])

    useEffect(() => {
        if (priceQueryResult.best.length > 0) {
            if (side === 'buy') {
                const lowestAvgPrice = priceQueryResult.best.reduce(
                    (min, obj) => Math.min(min, obj.grossAveragePrice),
                    Infinity
                )
                setBestAvgPrice(lowestAvgPrice)
            } else {
                const highestAvgPrice = priceQueryResult.best.reduce(
                    (min, obj) => Math.max(min, obj.grossAveragePrice),
                    -Infinity
                )
                setBestAvgPrice(highestAvgPrice)
            }
            const data = priceQueryResult.best.map((best, i) => ({
                ...best,
                dif: getDif(priceQueryResult.best, i),
                pctDif: getDifPct(priceQueryResult.best, i),
                filteredReason:
                    Number(getDifPct(priceQueryResult.best, i, false)) <= -0.1 ||
                    Number(getDifPct(priceQueryResult.best, i, false)) >= 0.1
                        ? 'High price slippage: ' + getDifPct(priceQueryResult.best, i)
                        : undefined,
            }))
            setTableData(data)
        }
    }, [priceQueryResult.best])

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
            if (process.env.NEXT_PUBLIC_MOCK_PRICES === 'true') {
                setPriceQueryResult(mockData)
            } else {
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
                const priceResult = await prices.json()
                setPriceQueryResult(priceResult)
                setResultInput({ side, amount, coin, quote })
            }
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

    function getDifPct(bests: PriceQueryResult[], i: number, format: boolean = true): string | number {
        if (i !== 0) {
            const best = bests[0]
            const current = bests[i]
            let pct = 0
            if (current && best) {
                pct = current.netCost / best.netCost - 1
            }
            return format ? (resultInput?.side === 'buy' ? '+' : '-') + round(Math.abs(pct * 100), 2) + '%' : pct
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

    const resultsReady = priceQueryResult.best.length > 0 && resultInput
    const submitDisabled = useMemo(() => !amount || !coin || isLoading, [amount, coin, isLoading])

    return (
        <div className={'mb-10 flex w-full flex-col items-center justify-center z-20'}>
            <Card
                className={
                    'relative mb-4 mt-4 flex w-full max-w-2xl select-none flex-col items-center justify-center gap-4 border py-8 text-lg font-bold sm:mt-10'
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
                <div className="mt-8 w-full max-w-[16rem]">
                    <TextSwitch side={side} setSide={setSide} />
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
                <div>
                    {quickSelectCoins.map((coin) => (
                        <Badge
                            variant={'outline'}
                            onClick={() => setCoin(coin)}
                            className={'group h-8 cursor-pointer gap-2 border hover:border-slate-400'}
                        >
                            <Coin symbol={coin} className={cn('size-4 group-hover:text-slate-300')} />
                            {coin}
                        </Badge>
                    ))}
                </div>
                <div className={'flex w-full justify-center'}>
                    <Button
                        variant={'default'}
                        className={
                            'mx-4 mt-4 flex w-full items-center gap-2 rounded-lg text-base font-bold text-black sm:w-44'
                        }
                        onClick={() => getPrices({ side, amount, coin })}
                        disabled={submitDisabled}
                        isLoading={isLoading}
                        aria-label="Search for prices"
                    >
                        <Search strokeWidth={3} className={'size-4'} />
                        Search
                    </Button>
                </div>
            </Card>
            {resultsReady && <HowDialog />}
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
                            <div className="text-slate-500">for {resultInput.quote}</div>
                        </div>
                    </>
                )}
            </div>
            <Card className={'relative !mb-0 w-full max-w-4xl'}>
                {isLoading && priceQueryResult.best.length > 0 && (
                    <div className="absolute inset-0 z-50">
                        <div className="flex size-full items-center justify-center">
                            <div className={'border-accent rounded-md border bg-slate-50 p-5 dark:bg-slate-950'}>
                                <Spinner className={'size-10 opacity-100'} />
                            </div>
                        </div>
                    </div>
                )}

                <Table>
                    {priceQueryResult.best.length === 0 && (
                        <TableCaption className={'mb-4'}>
                            <div>{isLoading ? 'Loading...' : 'No Data'}</div>
                        </TableCaption>
                    )}
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
                        {tableData.map((row, i) => (
                            <TableRow
                                key={row.exchange + '_' + i}
                                className={cn('border-2', {
                                    'border-green-500/30 dark:bg-green-950/30 bg-green-50/30': i === 0 && isLoading,
                                    'border-green-400 dark:border-green-900 dark:bg-gradient-to-t dark:from-background dark:to-green-900/40 bg-gradient-to-t from-white to-green-100/30':
                                        i === 0 && !isLoading,
                                    'opacity-50': row.filteredReason,
                                    hidden: hideFiltered && row.filteredReason,
                                })}
                            >
                                <TableCell className={cn('mr-2 p-0 sm:p-0 text-center', i === 0 && firstRowCellStyle)}>
                                    <a
                                        href={getExchangeUrl(row.exchange, coin, quote)}
                                        target={'_blank'}
                                        className={
                                            'flex w-full h-full items-center justify-start gap-1 p-2 sm:p-4 hover:text-amber-500 hover:underline sm:gap-2 dark:hover:text-amber-400'
                                        }
                                        onClick={() =>
                                            posthog.capture('exchange-link', {
                                                exchange: row.exchange,
                                                url: getAfiliateOrTradeUrl(row.exchange, coin, quote),
                                            })
                                        }
                                    >
                                        <div className={cn('flex gap-1 sm:gap-2 items-center justify-start')}>
                                            <ExchangeIcon
                                                exchange={row.exchange}
                                                withLabel
                                                labelClassName={
                                                    'py-0 max-w-[110px] truncate sm:max-w-none sm:truncate-none'
                                                }
                                                className={'w-full h-full justify-start'}
                                            />
                                            <ExternalLink
                                                className={cn(
                                                    'size-4 min-h-[1rem] min-w-[1rem]',
                                                    row.exchange.length > 15 && !isDesktop && '-ml-1.5'
                                                )}
                                            />
                                        </div>
                                    </a>
                                    {row.filteredReason && (
                                        <div className={'-mt-2 text-xs text-red-600 dark:text-red-400'}>
                                            {row.filteredReason}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        'text-right',
                                        bestAvgPrice === row.grossAveragePrice ? 'text-green-500' : ''
                                    )}
                                >
                                    {currencyFormat(row.grossAveragePrice, 'AUD', row.grossAveragePrice < 5 ? 4 : 2)}
                                </TableCell>
                                <TableCell className={cn('text-right')}>
                                    <Popover>
                                        <PopoverTrigger
                                            className={'cursor-help underline decoration-dashed underline-offset-2'}
                                        >
                                            {currencyFormat(row.fees)}
                                        </PopoverTrigger>
                                        <PopoverContent className={'w-fit p-2 text-sm'}>
                                            <p>
                                                {formatExchangeName(row.exchange)} fee:{' '}
                                                {round(row.feeRate * 100, 3) + '%'}
                                            </p>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell className={cn('text-right', i === 0 ? cn(firstRowCellStyle, '') : '')}>
                                    <div className="flex gap-2 justify-end">
                                        {i === 0 && (
                                            <div
                                                className={
                                                    'hidden sm:block px-2 py-0.5 text-xs w-fit dark:text-green-500 text-green-600 dark:bg-green-900 bg-green-100 ml-auto rounded-full'
                                                }
                                            >
                                                Best
                                            </div>
                                        )}
                                        {currencyFormat(row.netCost)}
                                    </div>
                                </TableCell>
                                <TableCell className={cn('text-right', i === 0 ? 'text-white' : 'text-red-500')}>
                                    {row.dif}
                                </TableCell>
                                <TableCell className={cn('text-right', i === 0 ? 'text-white' : 'text-red-500')}>
                                    {row.pctDif}
                                </TableCell>
                            </TableRow>
                        ))}
                        {!hideFiltered &&
                            priceQueryResult.errors.map(({ name, error }) => (
                                <TableRow
                                    key={name + '_error_row'}
                                    className={'bg-red-500/20 opacity-50 hover:bg-red-500/20'}
                                >
                                    <TableCell
                                        className={
                                            'mr-2 flex size-full items-center justify-start gap-2 whitespace-nowrap p-0 text-left sm:p-0'
                                        }
                                    >
                                        <a
                                            href={getExchangeUrl(name, coin, quote)}
                                            target={'_blank'}
                                            className={
                                                'flex w-full h-full items-center justify-start gap-1 p-2 sm:p-4 hover:text-amber-500 hover:underline sm:gap-2 dark:hover:text-amber-400'
                                            }
                                            onClick={() =>
                                                posthog.capture('exchange-link', {
                                                    exchange: name,
                                                    url: getAfiliateOrTradeUrl(name, coin, quote),
                                                })
                                            }
                                        >
                                            <div className={cn('flex gap-1 sm:gap-2 items-center justify-start')}>
                                                <ExchangeIcon
                                                    exchange={name}
                                                    withLabel
                                                    labelClassName={
                                                        'py-0 max-w-[110px] truncate sm:max-w-none sm:truncate-none'
                                                    }
                                                    className={'w-full h-full justify-start'}
                                                />
                                                <ExternalLink
                                                    className={cn(
                                                        'size-4 min-h-[1rem] min-w-[1rem]',
                                                        name.length > 15 && !isDesktop && '-ml-1.5'
                                                    )}
                                                />
                                            </div>
                                        </a>
                                    </TableCell>
                                    <TableCell className={'text-red-600 dark:text-red-400'} colspan={5}>
                                        {error.name ?? error?.toString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        {(priceQueryResult.errors.length > 0 || tableData.some((row) => row.filteredReason)) && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className={'p-4'}>
                                    <Button
                                        variant={'outline'}
                                        onClick={() => setHideFiltered((prev) => !prev)}
                                        aria-label={`${hideFiltered ? 'Show' : 'Hide'} filtered results`}
                                    >
                                        {hideFiltered ? (
                                            <>
                                                {`Show ${
                                                    tableData.filter((row) => row.filteredReason).length +
                                                    priceQueryResult.errors.length
                                                } filtered results`}
                                            </>
                                        ) : (
                                            <>
                                                {`Hide ${
                                                    tableData.filter((row) => row.filteredReason).length +
                                                    priceQueryResult.errors.length
                                                } filtered results`}
                                            </>
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
            {priceQueryResult.best.length > 0 && (
                <div
                    className={
                        'w-full max-w-4xl pb-4 pl-4 text-sm leading-4 text-slate-400 sm:pl-12 dark:text-slate-600 '
                    }
                >
                    <span className={'mt-2 flex items-start justify-start gap-1 w-fit dark:bg-slate-950 px-2'}>
                        <CornerLeftUp className={'size-4'} />
                        Want to support CoinStacker?
                    </span>
                    <span className={'flex justify-start gap-2 dark:bg-slate-950 px-2 w-fit'}>
                        Sign up to a new exchange using the referral links above.
                    </span>
                    <a
                        className={
                            'w-fit dark:bg-slate-950 px-2 flex justify-start gap-2 text-slate-600 underline underline-offset-4 hover:text-amber-600 dark:text-slate-400 dark:dark:hover:text-amber-400'
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
