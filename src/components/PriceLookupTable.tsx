import ExchangeType from '@/components/ExchangeType'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HybridTooltip, HybridTooltipContent, HybridTooltipTrigger } from '@/components/ui/hybrid-tooltip'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { getAfiliateOrTradeUrl } from '@/lib/constants'
import { cn, currencyFormat, exchangeTypes, formatExchangeName, getExchangeUrl } from '@/lib/utils'
import { useMediaQuery } from '@uidotdev/usehooks'
import { round } from 'lodash'
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Pin, TriangleAlert } from 'lucide-react'
import posthog from 'posthog-js'
import React, { memo, useMemo, useState } from 'react'
import Coin from './CoinIcon'
import ExchangeIcon from './ExchangeIcon'
import FeeType, { FeeTypeProps } from './FeeType'
import { WithdrawalFees } from './PriceLookup'
import Spinner from './Spinner'
import { InformationIcon } from './ui/information-icon'

type PriceQueryResult = {
    exchange: string
    netPrice: number
    netCost: number
    grossPrice: number
    grossAveragePrice: number
    fees: number
    feeRate: number
}

type PriceQueryParams = {
    side: 'buy' | 'sell'
    amount: string
    coin: string
    quote?: string
}

type TableRowData = PriceQueryResult & {
    dif: string
    pctDif: string
    filteredReason?: string
    totalIncFees?: number
}

const headers = [
    {
        id: 'exchange',
        title: 'Exchange',
    },
    {
        id: 'type',
        title: '',
        className: 'px-0',
    },
    {
        id: 'total',
        title: 'Total inc fees',
        className: 'text-right',
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
        id: 'withdrawalFee',
        title: 'Withdrawal Fee',
        className: 'text-right',
    },
    {
        id: 'dif',
        title: 'Change',
        className: 'text-right',
    },
]

const firstRowCellStyle = 'text-green-600 dark:text-green-500'

// Function to get color gradient based on dollar difference
const getChangeColor = (dif: string | undefined, tableData: TableRowData[]): string => {
    if (!dif || dif === '-') return 'text-white' // Best price row

    // Parse current dollar value
    const match = dif.match(/([+-]?)\$?([\d,]+\.?\d*)/)
    if (!match) {
        return 'text-red-500'
    }
    const currentValue = parseFloat((match[2] || '0').replace(/,/g, ''))

    // Get all dollar values, excluding filtered rows
    const allValues = tableData
        .slice(1) // Skip first row (best price)
        .filter((row) => !row.filteredReason) // Exclude rows with filteredReason
        .map((row) => {
            if (!row.dif || row.dif === '-') return 0
            const match = row.dif.match(/([+-]?)\$?([\d,]+\.?\d*)/)
            return match ? parseFloat((match[2] || '0').replace(/,/g, '')) : 0
        })
        .filter((val) => !isNaN(val) && val > 0)

    if (allValues.length === 0) return 'text-red-500'

    // Remove extreme outliers (values more than 10x the median)
    const sortedValues = [...allValues].sort((a, b) => a - b)
    const median = sortedValues[Math.floor(sortedValues.length / 2)] || 0
    const filteredValues = allValues.filter((val) => val <= median * 10)

    // Use filtered max, or original max if no values left after filtering
    const maxValue = filteredValues.length > 0 ? Math.max(...filteredValues) : Math.max(...allValues)

    // Calculate percentage: current value / max value
    const percentage = currentValue / maxValue

    // Map percentage to colors
    if (percentage <= 0.1) return 'text-red-300 dark:text-red-50'
    if (percentage <= 0.2) return 'text-red-400 dark:text-red-100'
    if (percentage <= 0.4) return 'text-red-500 dark:text-red-200'
    if (percentage <= 0.6) return 'text-red-600 dark:text-red-300'
    if (percentage <= 0.8) return 'text-red-700 dark:text-red-400'
    return 'text-red-800 dark:text-red-500' // Maximum value gets darkest red
}

const getWithdrawalFee = (
    withdrawalFees: Record<string, WithdrawalFees>,
    exchange: string,
    coin: string
): number | undefined => {
    const exchangeFees = withdrawalFees[exchange]
    if (!exchangeFees) return undefined
    const fee = exchangeFees.fees[coin] ?? exchangeFees.fees.override
    if (fee === undefined) return undefined
    return round(fee, 6)
}

// Helper functions
const getWithdrawalFeeDisplay = (withdrawalFees: Record<string, WithdrawalFees>, exchange: string, coin: string) => {
    const fee = getWithdrawalFee(withdrawalFees, exchange, coin)
    if (fee === undefined) return '!'
    return fee.toString()
}

const getWithdrawalFeeAUD = (
    withdrawalFees: Record<string, WithdrawalFees>,
    exchange: string,
    coin: string,
    netPrice: number
) => {
    if (!netPrice) return undefined
    const fee = getWithdrawalFee(withdrawalFees, exchange, coin)
    if (fee === undefined) return undefined
    return currencyFormat(fee * netPrice)
}

const getFeeType = (withdrawalFees: Record<string, WithdrawalFees>, exchange: string): FeeTypeProps['type'] => {
    const feeType = withdrawalFees[exchange]?.feeType
    if (feeType === undefined) return 'unavailable'
    return feeType
}

interface PriceLookupTableProps {
    priceQueryResult: {
        best: PriceQueryResult[]
        errors: { name: string; error: { name?: string } }[]
    }
    isLoading: boolean
    tableData: TableRowData[]
    hideFiltered: boolean
    setHideFiltered: (hide: boolean) => void
    withdrawalFees: Record<string, WithdrawalFees>
    resultInput?: PriceQueryParams
    coin: string
    quote: string
    bestAvgPrice?: number
    loadingWithdrawalFees: Record<string, boolean>
    includeWithdrawalFees: boolean
}

const PriceLookupTable: React.FC<PriceLookupTableProps> = memo(
    ({
        priceQueryResult,
        isLoading,
        tableData,
        hideFiltered,
        setHideFiltered,
        withdrawalFees,
        resultInput,
        coin,
        quote,
        bestAvgPrice,
        loadingWithdrawalFees,
        includeWithdrawalFees,
    }) => {
        const isDesktop = useMediaQuery('(min-width: 768px)')
        const [isStickyEnabled, setIsStickyEnabled] = useState(true)

        // Memoize color calculations to prevent unnecessary recalculations
        const memoizedColors = useMemo(() => {
            return tableData.map((row) => getChangeColor(row.dif, tableData))
        }, [tableData])

        return (
            <Card className={'relative mb-0! w-full max-w-4xl rounded-tl-none sm:rounded-tl-lg'}>
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
                            <div>
                                {isLoading ? (
                                    <TextShimmer className="text-sm" duration={1}>
                                        Getting prices...
                                    </TextShimmer>
                                ) : (
                                    'No Data'
                                )}
                            </div>
                        </TableCaption>
                    )}
                    <TableHeader>
                        <TableRow className={'hover:bg-muted/0'}>
                            {headers.map((header, index) => (
                                <TableHead
                                    key={header.id}
                                    className={cn(
                                        header.className,
                                        index === 0 && isStickyEnabled && 'sticky left-0 z-10 bg-background'
                                    )}
                                >
                                    <div className="flex items-center gap-2 justify-between">
                                        <span>{header.title}</span>
                                        {index === 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm-icon"
                                                className="h-6 w-6 p-0 hover:bg-muted"
                                                onClick={() => setIsStickyEnabled(!isStickyEnabled)}
                                                title={
                                                    isStickyEnabled ? 'Disable sticky column' : 'Enable sticky column'
                                                }
                                            >
                                                <Pin
                                                    className={cn(
                                                        'h-3 w-3 transition-colors',
                                                        isStickyEnabled ? 'text-blue-500' : 'text-muted-foreground'
                                                    )}
                                                />
                                            </Button>
                                        )}
                                    </div>
                                    {header.title === 'Fees' && resultInput?.quote && ` (${resultInput.quote})`}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className={cn('font-semibold', isLoading && 'opacity-30')}>
                        {tableData.map((row, i) => (
                            <TableRow
                                key={row.exchange + '_row_' + i}
                                className={cn('border-2 h-full', {
                                    'border-green-500/30 dark:bg-green-950/30 bg-green-50/30': i === 0 && isLoading,
                                    'border-green-400 dark:border-green-900 dark:bg-linear-to-t dark:from-background dark:to-green-900/40 bg-linear-to-t from-white to-green-100/30':
                                        i === 0 && !isLoading,
                                    'opacity-50': row.filteredReason,
                                    hidden: hideFiltered && row.filteredReason,
                                })}
                            >
                                <TableCell
                                    className={cn(
                                        'ml-0 mr-0 p-0 text-center sm:p-0 flex items-center justify-start py-1',
                                        isStickyEnabled && 'sticky left-0 z-10',
                                        i === 0 && firstRowCellStyle
                                    )}
                                >
                                    <div className="absolute inset-0 bg-slate-950 -z-10" />
                                    <div
                                        className={cn('absolute inset-0 -z-0', {
                                            'border-green-500/30 dark:bg-green-950/30 bg-green-50/30':
                                                i === 0 && isLoading,
                                            'border-green-400 dark:border-green-900 dark:bg-linear-to-t dark:from-background dark:to-green-900/40 bg-linear-to-t from-white to-green-100/30':
                                                i === 0 && !isLoading,
                                        })}
                                    />
                                    <a
                                        href={getExchangeUrl(row.exchange, coin, quote)}
                                        target={'_blank'}
                                        className={
                                            'z-20 group flex size-full items-center justify-start gap-1 p-2 hover:text-amber-500 underline sm:gap-2 sm:p-4 dark:hover:text-amber-400'
                                        }
                                        onClick={() =>
                                            posthog.capture('exchange-link', {
                                                exchange: row.exchange,
                                                url: getAfiliateOrTradeUrl(row.exchange, coin, quote),
                                            })
                                        }
                                    >
                                        <div className={cn('flex items-center justify-start gap-1 sm:gap-2')}>
                                            <ExchangeIcon
                                                exchange={row.exchange}
                                                withLabel
                                                labelClassName={
                                                    'py-0 max-w-[100px] truncate sm:max-w-none sm:truncate-none'
                                                }
                                                className={'size-full justify-start'}
                                            />
                                            <ExternalLink
                                                className={cn(
                                                    'size-4 min-h-[1rem] min-w-[1rem] opacity-0 transition-opacity group-hover:opacity-0 sm:group-hover:opacity-100',
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
                                <TableCell className={cn('text-right px-0', i === 0 ? cn(firstRowCellStyle, '') : '')}>
                                    <ExchangeType type={exchangeTypes[row.exchange]} />
                                </TableCell>
                                <TableCell className={cn('text-right', i === 0 ? cn(firstRowCellStyle, '') : '')}>
                                    <div className="flex justify-end gap-2 font-mono font-bold antialiased">
                                        {i === 0 && (
                                            <div
                                                className={
                                                    'ml-auto font-sans hidden w-fit rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600 sm:block dark:bg-green-900 dark:text-green-400'
                                                }
                                            >
                                                Best
                                            </div>
                                        )}
                                        <HybridTooltip>
                                            <HybridTooltipTrigger className="cursor-help underline decoration-dashed underline-offset-2 flex items-center gap-1">
                                                {includeWithdrawalFees &&
                                                    withdrawalFees[row.exchange]?.feeType === undefined && (
                                                        <InformationIcon icon={TriangleAlert} variant="destructive" />
                                                    )}
                                                {i === 0 ? (
                                                    <TextShimmer
                                                        duration={1.2}
                                                        spread={3}
                                                        className="[--base-color:var(--color-green-700)] [--base-gradient-color:var(--color-green-400)] dark:[--base-color:var(--color-green-500)] dark:[--base-gradient-color:var(--color-green-300)]"
                                                    >
                                                        {currencyFormat(row.totalIncFees)}
                                                    </TextShimmer>
                                                ) : (
                                                    currencyFormat(row.totalIncFees)
                                                )}
                                            </HybridTooltipTrigger>
                                            <HybridTooltipContent className="w-fit p-3 dark:border-slate-600">
                                                <div className="space-y-2 text-sm">
                                                    <div className="font-semibold text-center">
                                                        Total Cost Breakdown
                                                    </div>
                                                    <div className="space-y-1">
                                                        {resultInput && (
                                                            <div className="flex justify-between gap-4">
                                                                <span className="flex items-center gap-1">
                                                                    Base cost ({parseFloat(resultInput.amount)}
                                                                    <Coin
                                                                        symbol={resultInput.coin}
                                                                        className={'size-3'}
                                                                    />{' '}
                                                                    ×{' '}
                                                                    {currencyFormat(
                                                                        row.grossAveragePrice,
                                                                        'AUD',
                                                                        row.grossAveragePrice < 5 ? 4 : 2
                                                                    )}
                                                                    )
                                                                </span>
                                                                <span className="font-mono">
                                                                    {currencyFormat(
                                                                        parseFloat(resultInput.amount) *
                                                                            row.grossAveragePrice
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between gap-4">
                                                            <span>Exchange fees</span>
                                                            <span className="font-mono">
                                                                {resultInput &&
                                                                    (resultInput.side === 'buy' ? '+' : '-')}
                                                                {currencyFormat(row.fees)}
                                                            </span>
                                                        </div>
                                                        {(() => {
                                                            if (!resultInput || !includeWithdrawalFees) return null
                                                            const withdrawalFeeAmount = getWithdrawalFee(
                                                                withdrawalFees,
                                                                row.exchange,
                                                                resultInput.coin
                                                            )
                                                            if (withdrawalFeeAmount === undefined) return null
                                                            const withdrawalFeeAUD = withdrawalFeeAmount * row.netPrice
                                                            return (
                                                                <div>
                                                                    <div className="flex justify-between gap-4">
                                                                        <span className="flex items-center gap-1">
                                                                            Withdrawal fee {withdrawalFeeAmount}{' '}
                                                                            <Coin
                                                                                symbol={resultInput.coin}
                                                                                className={'size-3'}
                                                                            />
                                                                        </span>
                                                                        <span
                                                                            className={cn(
                                                                                'font-mono flex items-center gap-1',
                                                                                Math.abs(withdrawalFeeAUD) === 0 &&
                                                                                    'text-green-500'
                                                                            )}
                                                                        >
                                                                            {resultInput.side === 'buy' ? '+' : '-'}
                                                                            {currencyFormat(Math.abs(withdrawalFeeAUD))}
                                                                            {withdrawalFees[row.exchange]?.feeType ===
                                                                                undefined && (
                                                                                <AlertTriangle className="size-3 text-red-500" />
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    {withdrawalFees[row.exchange]?.feeType ===
                                                                        undefined && (
                                                                        <div className="text-xs text-red-500 text-cright">
                                                                            Withdrawal fee not provided by exchange
                                                                            <br />
                                                                            Using median fee of all other exchanges
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })()}
                                                        <div className="border-t pt-1 flex justify-between gap-4 font-semibold">
                                                            <span>Total:</span>
                                                            <span className="font-mono">
                                                                {i === 0 ? (
                                                                    <TextShimmer
                                                                        duration={1.2}
                                                                        spread={3}
                                                                        className="[--base-color:var(--color-green-700)] [--base-gradient-color:var(--color-green-400)] dark:[--base-color:var(--color-green-500)] dark:[--base-gradient-color:var(--color-green-300)]"
                                                                    >
                                                                        {currencyFormat(
                                                                            row.totalIncFees || row.netCost
                                                                        )}
                                                                    </TextShimmer>
                                                                ) : (
                                                                    currencyFormat(row.totalIncFees || row.netCost)
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </HybridTooltipContent>
                                        </HybridTooltip>
                                    </div>
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        'text-right font-mono font-bold antialiased',
                                        bestAvgPrice === row.grossAveragePrice ? 'text-green-500' : ''
                                    )}
                                >
                                    {currencyFormat(row.grossAveragePrice, 'AUD', row.grossAveragePrice < 5 ? 4 : 2)}
                                </TableCell>
                                <TableCell className={cn('text-right font-mono font-bold antialiased')}>
                                    <HybridTooltip>
                                        <HybridTooltipTrigger
                                            className={'cursor-help underline decoration-dashed underline-offset-2'}
                                        >
                                            {currencyFormat(row.fees)}
                                        </HybridTooltipTrigger>
                                        <HybridTooltipContent className={'w-fit p-1.5 dark:border-slate-600'}>
                                            <p>
                                                {formatExchangeName(row.exchange)} fee:{' '}
                                                {round(row.feeRate * 100, 3) + '%'}
                                            </p>
                                        </HybridTooltipContent>
                                    </HybridTooltip>
                                </TableCell>
                                <TableCell className={cn('text-right font-mono font-bold antialiased')}>
                                    {/* <HybridTooltip>
                                    <HybridTooltipTrigger className={'cursor-help'}> */}
                                    {loadingWithdrawalFees[row.exchange] ? (
                                        <Spinner className="mx-auto" />
                                    ) : (
                                        resultInput && (
                                            <div
                                                className={cn(
                                                    getWithdrawalFee(withdrawalFees, row.exchange, resultInput.coin) ===
                                                        0 && 'text-green-500'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'justify-end w-full flex items-center gap-1',
                                                        withdrawalFees[row.exchange]?.feeType === undefined &&
                                                            'text-red-500'
                                                    )}
                                                >
                                                    {getWithdrawalFeeAUD(
                                                        withdrawalFees,
                                                        row.exchange,
                                                        resultInput.coin,
                                                        row.netPrice
                                                    )}
                                                    <FeeType type={getFeeType(withdrawalFees, row.exchange)} />
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap justify-end font-light">
                                                    {getWithdrawalFeeDisplay(
                                                        withdrawalFees,
                                                        row.exchange,
                                                        resultInput.coin
                                                    )}
                                                    <Coin symbol={resultInput.coin} className={'size-3'} />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </TableCell>
                                <TableCell className={cn('text-right', i === 0 ? 'text-white' : memoizedColors[i])}>
                                    <div className="flex flex-col items-end">
                                        <div>{row.dif}</div>
                                        <div className="text-xs opacity-75">{row.pctDif}</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!hideFiltered &&
                            priceQueryResult.errors.map(({ name, error }) => (
                                <TableRow
                                    key={name + '_error_row'}
                                    className={'bg-red-700/20 hover:bg-red-700/25 opacity-50'}
                                >
                                    <TableCell
                                        className={cn(
                                            'ml-0 mr-0 p-0 text-center sm:p-0 flex items-center justify-start py-1',
                                            isStickyEnabled && 'sticky left-0 z-10'
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-slate-950 -z-10" />
                                        <div className="absolute inset-0 bg-red-700/20 -z-0" />
                                        <a
                                            href={getExchangeUrl(name, coin, quote)}
                                            target={'_blank'}
                                            className={
                                                'z-20 group flex size-full items-center justify-start gap-1 p-2 hover:text-amber-500 underline sm:gap-2 sm:p-4 dark:hover:text-amber-400'
                                            }
                                            onClick={() =>
                                                posthog.capture('exchange-link', {
                                                    exchange: name,
                                                    url: getAfiliateOrTradeUrl(name, coin, quote),
                                                })
                                            }
                                        >
                                            <div className={cn('flex items-center justify-start gap-1 sm:gap-2')}>
                                                <ExchangeIcon
                                                    exchange={name}
                                                    withLabel
                                                    labelClassName={
                                                        'py-0 max-w-[100px] truncate sm:max-w-none sm:truncate-none'
                                                    }
                                                    className={'size-full justify-start'}
                                                />
                                                <ExternalLink
                                                    className={cn(
                                                        'size-4 min-h-[1rem] min-w-[1rem] opacity-0 transition-opacity group-hover:opacity-0 sm:group-hover:opacity-100',
                                                        name.length > 15 && !isDesktop && '-ml-1.5'
                                                    )}
                                                />
                                            </div>
                                        </a>
                                    </TableCell>
                                    <TableCell className={'text-right px-0'}>
                                        <ExchangeType type={exchangeTypes[name]} />
                                    </TableCell>
                                    <TableCell
                                        className={'text-left text-red-600 dark:text-red-400 lg:pl-16 md:pl-8 pl-4'}
                                        colSpan={4}
                                    >
                                        {error.name ?? error.toString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        {(priceQueryResult.errors.length > 0 || tableData.some((row) => row.filteredReason)) && (
                            <TableRow className="hover:bg-transparent opacity-80">
                                <TableCell colSpan={5} className={'p-4'}>
                                    <Button
                                        variant={'outline'}
                                        onClick={() => setHideFiltered(!hideFiltered)}
                                        aria-label={`${hideFiltered ? 'Show' : 'Hide'} filtered results`}
                                        className="flex items-center gap-2"
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
                                        {hideFiltered ? (
                                            <ChevronDown className="size-4" />
                                        ) : (
                                            <ChevronUp className="size-4" />
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        )
    }
)

PriceLookupTable.displayName = 'PriceLookupTable'

export default PriceLookupTable
