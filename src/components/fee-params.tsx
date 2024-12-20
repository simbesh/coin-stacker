'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { RotateCcw, Settings2 } from 'lucide-react'

import { round } from 'lodash'
import { Button } from '@/components/ui/button'
import { defaultExchangeFees, formatExchangeName } from '@/lib/utils'
import { useLocalStorage } from '@uidotdev/usehooks'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LocalStorageKeys } from '@/lib/constants'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ExchangeIcon from '@/components/ExchangeIcon'
import posthog from 'posthog-js'

export function FeeParams() {
    const [open, setOpen] = useState(false)
    const [fees, setFees] = useLocalStorage<Record<string, number>>(LocalStorageKeys.ExchangeFees, defaultExchangeFees)

    useEffect(() => {
        const defaultExchangeKeys = Object.keys(defaultExchangeFees)
        const currentExchangeKeys = Object.keys(fees)
        const missingKeys = defaultExchangeKeys.filter((x) => !currentExchangeKeys.includes(x))

        if (missingKeys.length > 0) {
            setFees((prev) => ({
                ...prev,
                ...missingKeys.reduce((acc, curr) => ({ ...acc, [curr]: defaultExchangeFees[curr] }), {}),
            }))
        }
    }, [])

    useEffect(() => {
        if (open) {
            posthog.capture('open-config-fees')
        }
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={'bg-transparent'}>
                    <Settings2 className="size-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className={'absolute right-2 top-2 flex gap-2'}>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="size-4"
                                    className={'bg-transparent'}
                                    aria-label="Reset fees to default"
                                    onClick={() => setFees(defaultExchangeFees)}
                                >
                                    <RotateCcw className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Reset to default</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Exchange Fees</h4>
                        <p className="text-muted-foreground text-sm">Set your own fees if you are on a better tier.</p>
                    </div>
                    <div className="grid gap-2">
                        {Object.entries(fees).map(([exchange, fee]) => (
                            <div key={exchange + '-fee-input-key'} className="grid grid-cols-9 items-center gap-4">
                                <Label
                                    htmlFor={exchange + '-fee-input'}
                                    className={'col-span-5 flex items-center justify-start gap-2'}
                                >
                                    <ExchangeIcon exchange={exchange} />
                                    {formatExchangeName(exchange)}
                                </Label>
                                <div className={'col-span-4 flex items-center'}>
                                    <Input
                                        id={exchange + '-fee-input'}
                                        type={'number'}
                                        pattern={'(^\\.*)+(^0*)+^\\d+(\\.\\d+)?'}
                                        className="h-8"
                                        value={round(fee * 100, 2)}
                                        onChange={(e) =>
                                            setFees((prev) => ({
                                                ...prev,
                                                [exchange]: round(Number(e.target.value) / 100, 4),
                                            }))
                                        }
                                    />
                                    <Label className={'pointer-events-none -ml-10 px-3'}>%</Label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
