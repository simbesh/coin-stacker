'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { History } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@uidotdev/usehooks'
import { PriceQueryParams } from '@/types/types'
import Coin from '@/components/CoinIcon'
import { LocalStorageKeys } from '@/lib/constants'
import posthog from 'posthog-js'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
                <Button
                    variant="outline"
                    size="icon"
                    className={className}
                    disabled={history.length === 0}
                    aria-label="Open Price Query History"
                >
                    <History className="size-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-fit">
                <table className="">
                    {history.map((x) => (
                        <tr
                            className="my-1 cursor-pointer items-center font-semibold opacity-75 hover:bg-slate-100 hover:opacity-100 dark:hover:bg-slate-950"
                            onClick={() => {
                                raiseHistory(x)
                                setHistoryOpen(false)
                            }}
                            key={`${x.side}${x.amount}${x.coin}`}
                        >
                            <td className={'p-1'}>
                                <div
                                    className={cn(
                                        'w-12 rounded-sm py-0.5 text-center text-xs font-bold uppercase sm:font-semibold',
                                        x.side === 'buy'
                                            ? 'bg-green-100 text-green-500 ring-1 ring-green-500 dark:bg-green-950 dark:text-green-500 dark:ring-green-500'
                                            : 'bg-red-100 text-red-500 ring-1 ring-red-500 dark:bg-red-950 dark:text-red-500 dark:ring-red-500'
                                    )}
                                >
                                    {x.side}
                                </div>
                            </td>
                            <td className={'ml-auto w-fit p-1 pr-2 text-right'}>{x.amount}</td>
                            <td className={'flex w-fit items-center gap-1.5 p-1 text-right '}>
                                <Coin symbol={x.coin} className={'size-4'} />
                                {x.coin}
                            </td>
                        </tr>
                    ))}
                </table>
            </PopoverContent>
        </Popover>
    )
}
