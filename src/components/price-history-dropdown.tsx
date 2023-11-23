'use client'

import * as React from 'react'
import { History } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@uidotdev/usehooks'
import { PriceQueryParams } from '@/types/types'
import Coin from '@/components/CoinIcon'
import { useState, useEffect } from 'react'

interface Props {
    className?: string
    raiseHistory: (data: PriceQueryParams) => void
}

export function PriceHistoryDropdown({ className, raiseHistory }: Props) {
    const [historyOpen, setHistoryOpen] = useState(false)
    const [history] = useLocalStorage<PriceQueryParams[]>('price-query-history', [])
    useEffect(() => {
        if (historyOpen) {
            umami.track('open-price-history', { 'history-count': history.length })
        }
    }, [historyOpen])

    return (
        <DropdownMenu onOpenChange={setHistoryOpen} open={historyOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={className} disabled={history.length === 0}>
                    <History className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={'w-full'}>
                {history.map((x) => (
                    <DropdownMenuItem onClick={() => raiseHistory(x)}>
                        <div className={'flex w-full items-center justify-center gap-2'}>
                            <div
                                className={cn(
                                    'w-12 rounded-md text-center font-semibold capitalize',
                                    // 'text-secondary-foreground w-12 rounded-md text-center font-semibold capitalize',
                                    x.side === 'buy'
                                        ? 'border border-green-500 text-green-500'
                                        : 'border border-red-500 text-red-500'
                                )}
                            >
                                {x.side}
                            </div>
                            <div className={'ml-auto w-fit text-right'}>{x.amount}</div>
                            <div className={'flex w-fit gap-1 text-right'}>
                                <Coin symbol={x.coin} className={'icon-sm'} />
                                {x.coin}
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
