'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useLocalStorage } from '@uidotdev/usehooks'
import { LocalStorageKeys } from '@/lib/constants'
import { cn, defaultEnabledExchanges, exchangeFees } from '@/lib/utils'
import ExchangeIcon from '@/components/ExchangeIcon'
import { Separator } from '@/components/ui/separator'

const GeneralSettings = () => {
    const [fees, setFees] = useLocalStorage<Record<string, number>>(LocalStorageKeys.ExchangeFees, exchangeFees)
    const [enabledExchanges, setEnabledExchanges] = useLocalStorage<Record<string, boolean>>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges
    )

    function handleExchangeToggle(exchange: string) {
        setEnabledExchanges((prev) => ({ ...prev, [exchange]: !prev[exchange] }))
    }

    function handleSetAll(enabled: boolean) {
        setEnabledExchanges((prev) => Object.keys(prev).reduce((acc, curr) => ({ ...acc, [curr]: enabled }), {}))
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size={'icon'} variant={'ghost'}>
                    <Settings className={'h-5 w-5'} />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>General Settings</SheetTitle>
                    <SheetDescription>
                        Configure exchanges and fees below. Changes are saved automatically.
                    </SheetDescription>
                </SheetHeader>
                <div className={'mt-6'}>
                    {Object.entries(enabledExchanges).map(([exchange, enabled]) => (
                        <div
                            className={
                                'flex cursor-pointer items-center rounded-lg p-4 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }
                            onClick={() => handleExchangeToggle(exchange)}
                        >
                            <div className={cn('flex items-center gap-2', !enabled && 'opacity-50 grayscale')}>
                                <ExchangeIcon exchange={exchange} withLabel />
                            </div>
                            <div className={cn('ml-auto font-bold', enabled ? 'text-green-500' : 'text-red-500')}>
                                {enabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>
                    ))}
                </div>
                <Separator className={'my-4'} />
                <div className={'flex w-full justify-end gap-2'}>
                    <Button variant={'secondary'} onClick={() => handleSetAll(true)}>
                        Enable All
                    </Button>
                    <Button variant={'secondary'} onClick={() => handleSetAll(false)}>
                        Disable All
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default GeneralSettings
