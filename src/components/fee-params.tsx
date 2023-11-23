'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { Settings2 } from 'lucide-react'

import { round } from 'lodash'
import { Button } from '@/components/ui/button'
import { exchangeFees, formatExchangeName } from '@/lib/utils'
import { useLocalStorage } from '@uidotdev/usehooks'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function FeeParams() {
    const [open, setOpen] = useState(false)
    const [fees, setFees] = useLocalStorage<Record<string, number>>('cs-user-exchange-fees', exchangeFees)
    useEffect(() => {
        if (open) {
            umami.track('open-fee-params', { 'history-count': history.length })
        }
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={'absolute right-2 top-2 bg-transparent'}>
                    <Settings2 className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Exchange Fees</h4>
                        <p className="text-muted-foreground text-sm">Set your own fees if you are on a better tier.</p>
                    </div>
                    <div className="grid gap-2">
                        {Object.entries(fees).map(([exchange, fee]) => (
                            <div key={exchange + '-fee-input-key'} className="grid grid-cols-2 items-center gap-4">
                                <Label htmlFor={exchange + '-fee-input'} className={''}>
                                    {formatExchangeName(exchange)}
                                </Label>
                                <div className={'flex items-center'}>
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
