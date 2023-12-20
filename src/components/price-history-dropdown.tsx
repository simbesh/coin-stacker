'use client'

import * as React from 'react'
import { History, RotateCcw, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn, exchangeFees, formatExchangeName } from '@/lib/utils'
import { useLocalStorage } from '@uidotdev/usehooks'
import { PriceQueryParams } from '@/types/types'
import Coin from '@/components/CoinIcon'
import { useState, useEffect } from 'react'
import { LocalStorageKeys } from '@/lib/constants'
import posthog from 'posthog-js'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import ExchangeIcon from '@/components/ExchangeIcon'
import { Input } from '@/components/ui/input'
import { round } from 'lodash'

interface Props {
    className?: string
    raiseHistory: (data: PriceQueryParams) => void
}

export function PriceHistoryDropdown({ className, raiseHistory }: Props) {
    const [historyOpen, setHistoryOpen] = useState(false)
    const [history] = useLocalStorage<PriceQueryParams[]>(LocalStorageKeys.PriceQueryHistory, [])

    useEffect(() => {
        if (historyOpen) {
            posthog.capture('open-price-history', { 'history-count': history.length })
        }
    }, [historyOpen])

    return (
        <Popover onOpenChange={setHistoryOpen} open={historyOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={className} disabled={history.length === 0}>
                    <History className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-fit">
                <table className="">
                    {history.map((x) => (
                        <tr
                            className="my-1 cursor-pointer items-center hover:bg-slate-100 dark:hover:bg-slate-950"
                            onClick={() => {
                                raiseHistory(x)
                                setHistoryOpen(false)
                            }}
                            key={`${x.side}${x.amount}${x.coin}`}
                        >
                            <td className={'p-1'}>
                                <div
                                    className={cn(
                                        'w-12 rounded-md text-center text-sm font-semibold capitalize sm:text-base',
                                        // 'text-secondary-foreground w-12 rounded-md text-center font-semibold capitalize',
                                        x.side === 'buy'
                                            ? 'border border-green-500 text-green-500'
                                            : 'border border-red-500 text-red-500'
                                    )}
                                >
                                    {x.side}
                                </div>
                            </td>
                            <td className={'ml-auto w-fit p-1 pr-2 text-right'}>{x.amount}</td>
                            <td className={'flex w-fit items-center gap-1.5 p-1 text-right '}>
                                <Coin symbol={x.coin} className={'icon-sm'} />
                                {x.coin}
                            </td>
                        </tr>
                    ))}
                </table>
            </PopoverContent>
        </Popover>
    )
}
