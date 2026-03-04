'use client'

import { useLocalStorage } from '@uidotdev/usehooks'
import { History } from 'lucide-react'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import Coin from '@/components/CoinIcon'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LocalStorageKeys } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { PriceQueryParams } from '@/types/types'

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
    }, [historyOpen, history.length])

    return (
        <Popover onOpenChange={setHistoryOpen} open={historyOpen}>
            <PopoverTrigger asChild>
                <Button
                    aria-label="Open Price Query History"
                    className={className}
                    disabled={history.length === 0}
                    size="icon"
                    variant="outline"
                >
                    <History className="size-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-fit">
                <table className="">
                    {history.map((x) => (
                        <tr
                            className="my-2 cursor-pointer items-center rounded-md font-semibold hover:ring-1 hover:ring-slate-600"
                            key={`${x.side}${x.amount}${x.coin}`}
                            onClick={() => {
                                raiseHistory(x)
                                setHistoryOpen(false)
                            }}
                        >
                            <td className={'p-1'}>
                                <div
                                    className={cn(
                                        'w-12 rounded-sm py-0.5 text-center font-bold text-xs uppercase sm:font-semibold',
                                        x.side === 'buy'
                                            ? 'bg-green-100 text-green-500 ring-1 ring-green-500 dark:bg-green-950 dark:text-green-500 dark:ring-green-500'
                                            : 'bg-red-100 text-red-500 ring-1 ring-red-500 dark:bg-red-950 dark:text-red-500 dark:ring-red-500',
                                    )}
                                >
                                    {x.side}
                                </div>
                            </td>
                            <td className={'ml-auto w-fit p-1 pr-2 text-right'}>{x.amount}</td>
                            <td className={'flex w-fit items-center gap-1.5 p-1 text-right'}>
                                <Coin className={'size-4'} symbol={x.coin} />
                                {x.coin}
                            </td>
                        </tr>
                    ))}
                </table>
            </PopoverContent>
        </Popover>
    )
}
