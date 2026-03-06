'use client'

import { useLocalStorage } from '@uidotdev/usehooks'
import { differenceInDays } from 'date-fns'
import { cloneDeep, round } from 'lodash'
import { CornerLeftUp, HelpCircle, Search, X } from 'lucide-react'
import { useQueryState } from 'nuqs'
import posthog from 'posthog-js'
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import Coin from '@/components/CoinIcon'
import { Combobox } from '@/components/Combobox'
import ExchangeIcon from '@/components/ExchangeIcon'
import { FeeParams } from '@/components/fee-params'
import { PriceHistoryDropdown } from '@/components/price-history-dropdown'
import Spinner from '@/components/Spinner'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LocalStorageKeys, markets } from '@/lib/constants'
import {
    cn,
    currencyFormat,
    defaultEnabledExchanges,
    defaultExchangeFees,
    getExchangeUrl,
    median,
    OLD_KRAKEN_TAKER_FEE,
    overrideDefaultExchangeFees,
} from '@/lib/utils'
import type { PriceQueryParams } from '@/types/types'
import HowDialog from './HowDialog'
import { LabeledSwitch } from './LabeledSwitch'
import { mockData, mockQuery } from './mock-data'
import PriceLookupTable from './PriceLookupTable'
import TextSwitch from './TextSwitch'
import { Button } from './ui/button'
import { HybridTooltip, HybridTooltipContent, HybridTooltipTrigger } from './ui/hybrid-tooltip'

const DEBUG = process.env.NEXT_PUBLIC_MOCK_PRICES === 'true'

export interface WithdrawalFees {
    fees: Record<string, number>
    feeType?: 'dynamic' | 'static' | 'unavailable'
}

interface PriceQueryResult {
    exchange: string
    feeRate: number
    fees: number
    grossAveragePrice: number
    grossPrice: number
    netCost: number
    netPrice: number
}

function calculateTotalWithWithdrawalFees(
    best: PriceQueryResult,
    options: {
        coin: string
        finalWithdrawalFees: Record<string, WithdrawalFees>
        includeWithdrawalFees: boolean
        side: 'buy' | 'sell'
    },
): number {
    const { includeWithdrawalFees, coin, finalWithdrawalFees, side } = options
    let totalIncFees = best.netCost
    if (!(includeWithdrawalFees && coin)) {
        return totalIncFees
    }

    const exchangeFees = finalWithdrawalFees[best.exchange]
    if (!exchangeFees) {
        return totalIncFees
    }

    const withdrawalFee = exchangeFees.fees[coin] ?? exchangeFees.fees.override
    if (withdrawalFee === undefined) {
        return totalIncFees
    }

    const withdrawalFeeAUD = withdrawalFee * best.netPrice
    if (side === 'buy') {
        totalIncFees += withdrawalFeeAUD
    } else {
        totalIncFees -= withdrawalFeeAUD
    }

    return totalIncFees
}

function filterPriceOutliers(prices: number[]): number[] {
    if (prices.length === 0) {
        return []
    }

    // Calculate median
    const sortedPrices = [...prices].sort((a, b) => a - b)
    const mid = Math.floor(sortedPrices.length / 2)
    const lowerMid = sortedPrices[mid - 1]
    const upperMid = sortedPrices[mid]
    const medianPrice =
        sortedPrices.length % 2 === 0 && lowerMid !== undefined && upperMid !== undefined
            ? (lowerMid + upperMid) / 2
            : upperMid

    if (typeof medianPrice !== 'number') {
        return prices
    }

    // Filter prices within threshold bounds (plus/minus 10% from median)
    const lowerBound = medianPrice * 0.9
    const upperBound = medianPrice * 1.1
    return prices.filter((price) => price >= lowerBound && price <= upperBound)
}

function getComparableCost(
    result: PriceQueryResult & { totalIncFees?: number },
    includeWithdrawalFees: boolean,
): number {
    if (includeWithdrawalFees) {
        return result.totalIncFees ?? result.netCost
    }

    return result.netCost
}

function getDifPct(
    bests: (PriceQueryResult & { totalIncFees?: number })[],
    i: number,
    options: {
        includeWithdrawalFees: boolean
        side: 'buy' | 'sell'
    },
): string {
    if (i === 0) {
        return '-'
    }

    const best = bests[0]
    const current = bests[i]
    if (!(best && current)) {
        return '-'
    }

    const bestCost = getComparableCost(best, options.includeWithdrawalFees)
    const currentCost = getComparableCost(current, options.includeWithdrawalFees)
    const pct = currentCost / bestCost - 1
    const prefix = options.side === 'buy' ? '+' : '-'

    return `${prefix}${round(Math.abs(pct * 100), 2)}%`
}

function getDif(
    bests: (PriceQueryResult & { totalIncFees?: number })[],
    i: number,
    options: {
        includeWithdrawalFees: boolean
        side: 'buy' | 'sell'
    },
): string {
    if (i === 0) {
        return '-'
    }

    const best = bests[0]
    const current = bests[i]
    if (!(best && current)) {
        return '-'
    }

    const bestCost = getComparableCost(best, options.includeWithdrawalFees)
    const currentCost = getComparableCost(current, options.includeWithdrawalFees)
    const dif = currentCost - bestCost
    const prefix = options.side === 'buy' ? '+' : ''

    return `${prefix}${currencyFormat(dif)}`
}

const quickSelectCoins = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT']

const WAYEX_BANNER_KEY = 'wayex-banner-state'
const BANNER_EXPIRY_DAYS = 7

interface WayexBannerState {
    dismissed: boolean
    firstView: string | null
}

const PriceLookup = () => {
    const [side, setSide] = useQueryState<'buy' | 'sell'>('side', {
        defaultValue: 'buy',
        parse: (value: string): 'buy' | 'sell' => (value === 'buy' || value === 'sell' ? value : 'buy'),
    })
    const [hideFiltered, setHideFiltered] = useState(true)
    const [includeWithdrawalFees, setIncludeWithdrawalFees] = useLocalStorage(
        LocalStorageKeys.IncludeWithdrawalFees,
        false,
    )
    const [amount, setAmount] = useQueryState('amount', { defaultValue: '' })
    const [localAmount, setLocalAmount] = useState('')
    const localAmountRef = useRef('')
    const [coin, setCoin] = useQueryState('coin', { defaultValue: '' })

    // Local state for inputs that shouldn't trigger immediate updates
    const [localSide, setLocalSide] = useState<'buy' | 'sell'>(side)
    const [localCoin, setLocalCoin] = useState(coin)
    const [quote, setQuote] = useQueryState('quote', { defaultValue: 'AUD' })
    const [isLoading, setIsLoading] = useState(false)
    const [priceQueryResult, setPriceQueryResult] = useState<{
        best: PriceQueryResult[]
        errors: { name: string; error: { name?: string } }[]
    }>({ best: [], errors: [] })
    const [resultInput, setResultInput] = useState<PriceQueryParams | undefined>(DEBUG ? mockQuery : undefined)
    const [, setHistory] = useLocalStorage<PriceQueryParams[]>(LocalStorageKeys.PriceQueryHistory, [])
    const [fees, setFees] = useLocalStorage<Record<string, number>>(LocalStorageKeys.ExchangeFees, defaultExchangeFees)
    const [bestAvgPrice, setBestAvgPrice] = useState<number>()
    const [tableData, setTableData] = useState<
        (PriceQueryResult & { dif: string; pctDif: string; filteredReason?: string })[]
    >([])

    // Defer expensive table updates while user is typing
    const deferredTableData = useDeferredValue(tableData)

    const [tryUpdateFees, setTryUpdateFees] = useState(false)
    const [withdrawalFees, setWithdrawalFees] = useState<Record<string, WithdrawalFees>>({})
    const summaryTabRef = useRef<HTMLDivElement>(null)
    const lastAutoFetchKeyRef = useRef<string | null>(null)
    const [loadingWithdrawalFees, setLoadingWithdrawalFees] = useState<Record<string, boolean>>({})
    const fetchedWithdrawalFeesRef = useRef<Set<string>>(new Set())
    const [finalWithdrawalFees, setFinalWithdrawalFees] = useState<Record<string, WithdrawalFees>>({})

    useEffect(() => {
        const allFees: number[] = []
        const newWithdrawalFees = cloneDeep(withdrawalFees)
        for (const data of Object.values(newWithdrawalFees)) {
            if (data.feeType !== undefined && data.fees[coin] !== undefined) {
                allFees.push(data.fees[coin])
            }
        }
        const medianFee = median(allFees)
        if (medianFee !== undefined) {
            for (const data of Object.values(newWithdrawalFees)) {
                if (data.feeType === undefined) {
                    data.fees[coin] = medianFee
                }
            }
        }
        setFinalWithdrawalFees(newWithdrawalFees)
    }, [withdrawalFees, coin])

    // Fetch withdrawal fees from API
    const fetchWithdrawalFees = useCallback(async (exchange: string, currency: string) => {
        try {
            const response = await fetch(`/api/exchange/withdrawal-fee?exchange=${exchange}&currency=${currency}`)
            if (response.ok) {
                const { fees, feeType } = await response.json()
                setWithdrawalFees((prev) => ({
                    ...prev,
                    [exchange]: { fees, feeType },
                }))
            }
        } catch (error) {
            console.error('Error fetching withdrawal fees:', error)
        }
    }, [])

    // update fees to NEW default from old default
    useEffect(() => {
        if (!tryUpdateFees) {
            setTryUpdateFees(true)
            const updates: Record<string, number> = {}
            for (const [exchange, { old, new: newFee }] of Object.entries(overrideDefaultExchangeFees)) {
                if (fees[exchange] === old) {
                    updates[exchange] = newFee
                }
            }
            if (Object.keys(updates).length > 0) {
                setFees((prev) => ({
                    ...prev,
                    ...updates,
                }))
            }
        }
    }, [fees, setFees, tryUpdateFees])

    const [enabledExchanges] = useLocalStorage<Record<string, boolean>>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges,
    )
    const [wayexBannerState, setWayexBannerState] = useLocalStorage<WayexBannerState>(WAYEX_BANNER_KEY, {
        dismissed: false,
        firstView: null,
    })

    const getPrices = useCallback(getPricesImpl, [enabledExchanges, fees, quote, setHistory])

    const handleKeyPress = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter' && localAmountRef.current && localCoin && !isLoading) {
                setAmount(localAmountRef.current)
                setSide(localSide)
                setCoin(localCoin)
                getPrices({ side: localSide, amount: localAmountRef.current, coin: localCoin })
            }
        },
        [localSide, localCoin, isLoading, setAmount, setSide, setCoin, getPrices],
    )

    useEffect(() => {
        window.addEventListener('keypress', handleKeyPress)
        return () => {
            window.removeEventListener('keypress', handleKeyPress)
        }
    }, [handleKeyPress])

    useEffect(() => {
        setLocalAmount(amount)
        localAmountRef.current = amount
    }, [amount])

    // Sync local state with query state when they change externally (e.g., from history)
    useEffect(() => {
        setLocalSide(side)
    }, [side])

    useEffect(() => {
        setLocalCoin(coin)
    }, [coin])

    useEffect(() => {
        if (!(coin && amount)) {
            lastAutoFetchKeyRef.current = null
            return
        }

        const autoFetchKey = `${side}|${amount}|${coin}|${quote}`
        if (lastAutoFetchKeyRef.current === autoFetchKey) {
            return
        }

        lastAutoFetchKeyRef.current = autoFetchKey

        getPrices({ side, amount, coin })
    }, [amount, coin, getPrices, quote, side])

    useEffect(() => {
        const newFees = { ...fees }
        if (newFees.kraken === OLD_KRAKEN_TAKER_FEE) {
            // reset fee to new rate
            newFees.kraken = Number(defaultExchangeFees.kraken)
            setFees(newFees)
        }
    }, [fees, setFees])

    useEffect(() => {
        if (priceQueryResult.best.length > 0) {
            const resultSide = resultInput?.side ?? side
            if (side === 'buy') {
                const lowestAvgPrice = priceQueryResult.best.reduce(
                    (min, obj) => Math.min(min, obj.grossAveragePrice),
                    Number.POSITIVE_INFINITY,
                )
                setBestAvgPrice(lowestAvgPrice)
            } else {
                const highestAvgPrice = priceQueryResult.best.reduce(
                    (min, obj) => Math.max(min, obj.grossAveragePrice),
                    Number.NEGATIVE_INFINITY,
                )
                setBestAvgPrice(highestAvgPrice)
            }
            const removedOutliers: number[] = filterPriceOutliers(
                priceQueryResult.best.map((best) => best.grossAveragePrice),
            )

            // Calculate total including withdrawal fees for each result
            const resultsWithWithdrawalFees = priceQueryResult.best.map((best) => ({
                ...best,
                totalIncFees: calculateTotalWithWithdrawalFees(best, {
                    includeWithdrawalFees,
                    coin,
                    finalWithdrawalFees,
                    side,
                }),
            }))

            // Sort by totalIncFees when includeWithdrawalFees is true, otherwise by netCost
            const sortField = includeWithdrawalFees ? 'totalIncFees' : 'netCost'
            resultsWithWithdrawalFees.sort((a, b) => {
                const aInOutliers = removedOutliers.includes(a.grossAveragePrice)
                const bInOutliers = removedOutliers.includes(b.grossAveragePrice)
                if (aInOutliers && !bInOutliers) {
                    return -1
                }
                if (!aInOutliers && bInOutliers) {
                    return 1
                }

                // Sort by the appropriate field based on side
                const sortMultiplier = side === 'buy' ? 1 : -1
                if (a[sortField] < b[sortField]) {
                    return -sortMultiplier
                }
                if (b[sortField] < a[sortField]) {
                    return sortMultiplier
                }
                return 0
            })

            const data = resultsWithWithdrawalFees.map((best, i) => ({
                ...best,
                dif: getDif(resultsWithWithdrawalFees, i, {
                    includeWithdrawalFees,
                    side: resultSide,
                }),
                pctDif: getDifPct(resultsWithWithdrawalFees, i, {
                    includeWithdrawalFees,
                    side: resultSide,
                }),
                filteredReason: removedOutliers.includes(best.grossAveragePrice)
                    ? undefined
                    : `Price outlier: ${getDifPct(resultsWithWithdrawalFees, i, {
                          includeWithdrawalFees,
                          side: resultSide,
                      })}`,
            }))
            setTableData(data)
        }
    }, [priceQueryResult.best, includeWithdrawalFees, coin, side, finalWithdrawalFees, resultInput])

    // Fetch withdrawal fees when price results change
    useEffect(() => {
        if (priceQueryResult.best.length > 0 && coin) {
            const exchanges = [...new Set(priceQueryResult.best.map((row) => row.exchange))]

            // Only set loading and fetch for exchanges we haven't fetched yet
            const exchangesToFetch = exchanges.filter((exchange) => {
                const key = `${exchange}-${coin}`
                return !fetchedWithdrawalFeesRef.current.has(key)
            })

            if (exchangesToFetch.length > 0) {
                setLoadingWithdrawalFees((prev) => ({
                    ...prev,
                    ...Object.fromEntries(exchangesToFetch.map((e) => [e, true])),
                }))

                Promise.all(
                    exchangesToFetch.map(async (exchange) => {
                        const key = `${exchange}-${coin}`
                        fetchedWithdrawalFeesRef.current.add(key)
                        await fetchWithdrawalFees(exchange, coin)
                        setLoadingWithdrawalFees((prev) => ({ ...prev, [exchange]: false }))
                    }),
                ).catch((error: unknown) => {
                    console.error('Error fetching withdrawal fees:', error)
                })
            }
        }
    }, [priceQueryResult.best, coin, fetchWithdrawalFees])

    async function getPricesImpl({ side, amount, coin }: PriceQueryParams) {
        if (!amount) {
            return
        }
        const floatAmount = Number.parseFloat(amount)
        if (!(floatAmount && coin)) {
            return
        }
        const data = {
            side,
            amount: floatAmount,
            coin,
        }
        posthog.capture('price-lookup', data)

        setHistory((prev) => {
            const latest = prev[0]
            if (latest?.coin === coin && latest.side === side && latest.amount === amount && latest.quote === quote) {
                return prev
            }

            const exists = prev.find((h) => h.coin === coin && h.side === side && h.amount === amount)
            const nextHistory = exists
                ? [
                      { quote, side, amount, coin },
                      ...prev.filter((h) => h.coin !== coin || h.side !== side || h.amount !== amount),
                  ]
                : [{ quote, side, amount, coin }, ...prev]

            return nextHistory.slice(0, 6)
        })
        setIsLoading(true)
        try {
            if (DEBUG) {
                setPriceQueryResult(mockData)
            } else {
                const prices = await fetch('api/price-query', {
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
        } catch (_error) {
            return
        }
        // Scroll to the SummaryTab
        setTimeout(() => {
            if (summaryTabRef.current) {
                const rect = summaryTabRef.current.getBoundingClientRect()
                const offsetTop = window.pageYOffset + rect.top - 80
                window.scrollTo({ top: offsetTop, left: 0, behavior: 'smooth' })
            }
        }, 300)
        setIsLoading(false)
    }

    function handleHistoryClick(data: PriceQueryParams) {
        if (!isLoading) {
            setSide(data.side)
            setAmount(data.amount.toString())
            setCoin(data.coin)
            setLocalSide(data.side)
            setLocalAmount(data.amount.toString())
            setLocalCoin(data.coin)
            getPrices(data).catch(() => {
                return
            })
        }
    }

    const resultsReady = priceQueryResult.best.length > 0 && resultInput
    const submitDisabled = useMemo(() => !(localAmount && localCoin) || isLoading, [localAmount, localCoin, isLoading])

    // Check if banner should be shown
    useEffect(() => {
        if (!(wayexBannerState.dismissed || wayexBannerState.firstView)) {
            setWayexBannerState((prev) => {
                if (prev.firstView) {
                    return prev
                }

                return {
                    ...prev,
                    firstView: new Date().toISOString(),
                }
            })
        }
    }, [wayexBannerState.dismissed, wayexBannerState.firstView, setWayexBannerState])

    const showWayexBanner = useMemo(() => {
        if (wayexBannerState.dismissed) {
            return false
        }

        if (!wayexBannerState.firstView) {
            return true
        }

        // Check if a week has passed since first view and if date is before November 1 2025
        const daysSinceFirstView = differenceInDays(new Date(), new Date(wayexBannerState.firstView))
        const isBeforeNovember2025 = new Date() < new Date('2025-11-01')
        return daysSinceFirstView < BANNER_EXPIRY_DAYS && isBeforeNovember2025
    }, [wayexBannerState.dismissed, wayexBannerState.firstView])

    const handleDismissBanner = () => {
        setWayexBannerState((prev) => ({
            ...prev,
            dismissed: true,
        }))
    }

    const [enabledExchangesCount, totalExchangesCount] = useMemo(() => {
        return [Object.values(enabledExchanges).filter(Boolean).length, Object.keys(enabledExchanges).length]
    }, [enabledExchanges])

    const enabledExchangesText = useMemo(() => {
        return `${enabledExchangesCount}/${totalExchangesCount} Exchanges enabled`
    }, [enabledExchangesCount, totalExchangesCount])

    return (
        <>
            {showWayexBanner && (
                <div className="relative z-20 w-full space-x-2 bg-linear-to-r from-blue-500 via-blue-300 to-blue-500 px-4 py-2 text-center text-sm sm:text-base dark:from-blue-800 dark:via-blue-500 dark:to-blue-800">
                    <a
                        className="inline-flex cursor-pointer items-center hover:underline"
                        href={getExchangeUrl('wayex')}
                        target="_blank"
                    >
                        🎉 New Exchange{' '}
                        <ExchangeIcon className="mx-1 px-1" exchange="wayex" labelClassName="font-bold" withLabel /> has
                        been added!{' '}
                    </a>
                    <button
                        aria-label="Dismiss banner"
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 hover:bg-blue-600/50"
                        onClick={handleDismissBanner}
                        type="button"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}
            <div className={'z-20 mb-8 flex w-full flex-col items-center justify-center'}>
                <Card
                    className={
                        'relative my-4 flex w-full max-w-2xl select-none flex-col items-center justify-center gap-4 border py-8 pb-4 font-bold text-lg sm:mt-4'
                    }
                >
                    <PriceHistoryDropdown
                        className={'absolute top-2 left-2 bg-transparent'}
                        raiseHistory={handleHistoryClick}
                    />
                    <div className={'absolute top-2 right-2 flex gap-2'}>
                        <Combobox
                            className={'w-fit bg-card'}
                            options={['AUD', 'USD', 'USDT', 'USDC'].map((q) => ({
                                value: q,
                                label: (
                                    <div className={'flex items-center gap-2 font-semibold text-lg'} key={q}>
                                        {q}
                                    </div>
                                ),
                            }))}
                            optionType={'Quote'}
                            setValue={setQuote}
                            value={quote}
                        />
                        <FeeParams />
                    </div>
                    <div className="mt-8 w-full max-w-[16rem] sm:mt-0">
                        <TextSwitch setSide={setLocalSide} side={localSide} />
                    </div>
                    <div className={'flex gap-2'}>
                        <Input
                            className={'w-24 text-right text-lg ring-0 focus-visible:ring-0 sm:w-40'}
                            onBlur={() => setAmount(localAmount)}
                            onChange={(e) => {
                                setLocalAmount(e.target.value)
                                localAmountRef.current = e.target.value
                            }}
                            type={'number'}
                            value={localAmount}
                        />
                        <Combobox
                            className={'w-[160px] bg-card'}
                            options={markets.map((market) => ({
                                value: market,
                                label: (
                                    <div className={'flex items-center gap-2 font-semibold text-lg'} key={market}>
                                        <Coin symbol={market} />
                                        {market}
                                    </div>
                                ),
                            }))}
                            optionType={'Coin'}
                            setValue={setLocalCoin}
                            value={localCoin}
                        />
                    </div>
                    <div>
                        {quickSelectCoins.map((coin) => (
                            <Badge
                                className={'group h-8 cursor-pointer gap-2 border hover:border-slate-400'}
                                key={coin}
                                onClick={() => setLocalCoin(coin)}
                                variant={'outline'}
                            >
                                <Coin className={cn('size-4 group-hover:text-slate-300')} symbol={coin} />
                                {coin}
                            </Badge>
                        ))}
                    </div>
                    <div className={'flex w-full justify-center'}>
                        <Button
                            aria-label="Search for prices"
                            className={'mx-4 w-fit rounded-lg font-bold text-base text-black'}
                            data-loading={isLoading}
                            disabled={submitDisabled}
                            onClick={() => {
                                setAmount(localAmountRef.current)
                                setSide(localSide)
                                setCoin(localCoin)
                                getPrices({ side: localSide, amount: localAmountRef.current, coin: localCoin })
                            }}
                            variant={'default'}
                        >
                            <span className={'grid place-items-center'}>
                                <span
                                    className={cn(
                                        'col-start-1 row-start-1 flex items-center gap-2',
                                        isLoading && 'invisible',
                                    )}
                                >
                                    <Search className={'size-4'} strokeWidth={3} />
                                    Compare Prices
                                </span>
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'invisible col-start-1 row-start-1 flex items-center justify-center',
                                        isLoading && 'visible',
                                    )}
                                >
                                    <Spinner className={'size-5'} />
                                </span>
                            </span>
                        </Button>
                    </div>
                    <span className={'font-medium text-slate-600 text-xs'}>{enabledExchangesText}</span>
                </Card>
                <div className="relative w-full max-w-4xl">
                    {resultsReady && (
                        <div className="left-0 mx-auto mb-8 flex w-fit items-center gap-2 sm:absolute sm:-bottom-2 sm:mb-0">
                            <HowDialog />
                        </div>
                    )}
                    <div
                        className={cn(
                            'mt-4 flex h-6 w-full items-center justify-start font-bold text-sm sm:justify-center',
                            isLoading && 'opacity-30',
                        )}
                    >
                        {resultsReady && (
                            <SummaryTab
                                amount={resultInput.amount || ''}
                                coin={resultInput.coin || ''}
                                quote={resultInput.quote || ''}
                                ref={summaryTabRef}
                                side={resultInput.side}
                            />
                        )}
                    </div>
                    <div className="absolute right-0 bottom-0 flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <LabeledSwitch
                                checked={includeWithdrawalFees}
                                label="Withdrawal Fee"
                                onCheckedChange={setIncludeWithdrawalFees}
                            />
                            <HybridTooltip>
                                <HybridTooltipTrigger>
                                    <HelpCircle className={'size-4'} />
                                </HybridTooltipTrigger>
                                <HybridTooltipContent className={'dark:border-slate-600'}>
                                    <p>{`Add the exchanges ${resultInput?.coin ? ` ${resultInput.coin}` : ''} withdrawal fee to total price.`}</p>
                                </HybridTooltipContent>
                            </HybridTooltip>
                        </div>
                    </div>
                </div>
                <PriceLookupTable
                    bestAvgPrice={bestAvgPrice}
                    coin={resultInput?.coin || ''}
                    hideFiltered={hideFiltered}
                    includeWithdrawalFees={includeWithdrawalFees}
                    isLoading={isLoading}
                    loadingWithdrawalFees={loadingWithdrawalFees}
                    priceQueryResult={priceQueryResult}
                    quote={resultInput?.quote || quote}
                    resultInput={resultInput}
                    setHideFiltered={setHideFiltered}
                    tableData={deferredTableData}
                    withdrawalFees={finalWithdrawalFees}
                />
                {priceQueryResult.best.length > 0 && (
                    <div
                        className={
                            'w-full max-w-4xl pb-4 pl-4 text-slate-400 text-sm leading-4 sm:pl-12 dark:text-slate-600'
                        }
                    >
                        <span className={'mt-2 flex w-fit items-start justify-start gap-1 px-2 dark:bg-slate-950'}>
                            <CornerLeftUp className={'size-4'} />
                            Want to support CoinStacker?
                        </span>
                        <span className={'flex w-fit justify-start gap-2 px-2 dark:bg-slate-950'}>
                            Sign up to a new exchange using the referral links above.
                        </span>
                        <a
                            className={
                                'flex w-fit justify-start gap-2 px-2 text-slate-600 underline underline-offset-4 hover:text-amber-600 dark:bg-slate-950 dark:text-slate-400 dark:dark:hover:text-amber-400'
                            }
                            href={'https://ko-fi.com/simonbechard'}
                        >
                            or buy us a coffee! ☕
                        </a>
                    </div>
                )}
            </div>
        </>
    )
}

export default PriceLookup

const SummaryTab = React.forwardRef<
    HTMLDivElement,
    {
        side: 'buy' | 'sell'
        amount: string
        coin: string
        quote: string
    }
>(({ side, amount, coin, quote }, ref) => {
    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-t-md border bg-card px-2 capitalize',
                side === 'buy' ? 'border-emerald-800' : 'border-red-800',
            )}
            ref={ref}
        >
            <div
                className={cn(
                    side === 'buy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                )}
            >
                {side}
            </div>
            <div>{amount}</div>
            <Coin className={'size-6'} symbol={coin} />
            <div>{coin}</div>
            <div className="text-slate-500">for {quote}</div>
        </div>
    )
})

SummaryTab.displayName = 'SummaryTab'
