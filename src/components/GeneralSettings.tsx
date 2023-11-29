'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useLocalStorage } from '@uidotdev/usehooks'
import { LocalStorageKeys } from '@/lib/constants'
import { cn, defaultEnabledExchanges } from '@/lib/utils'
import ExchangeIcon from '@/components/ExchangeIcon'
import { Separator } from '@/components/ui/separator'

const GeneralSettings = () => {
    const [enabledExchanges, setEnabledExchanges] = useLocalStorage<string[]>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges
    )

    function handleExchangeToggle(exchange: string) {
        setEnabledExchanges((prev) => {
            if (prev.includes(exchange)) {
                return prev.filter((x) => x !== exchange)
            } else {
                return [...prev, exchange]
            }
        })
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
                    {defaultEnabledExchanges.map((exchange) => (
                        <div
                            className={
                                'flex cursor-pointer items-center rounded-lg p-4 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }
                            onClick={() => handleExchangeToggle(exchange)}
                            key={exchange + '-exchange-toggle'}
                        >
                            <div
                                className={cn(
                                    'flex items-center gap-2',
                                    !enabledExchanges.includes(exchange) && 'opacity-50 grayscale'
                                )}
                            >
                                <ExchangeIcon exchange={exchange} withLabel />
                            </div>
                            <div
                                className={cn(
                                    'ml-auto font-bold',
                                    enabledExchanges.includes(exchange) ? 'text-green-500' : 'text-red-500'
                                )}
                            >
                                {enabledExchanges.includes(exchange) ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>
                    ))}
                </div>
                <Separator className={'my-4'} />
                <div className={'flex w-full justify-end gap-2'}>
                    <Button variant={'secondary'} onClick={() => setEnabledExchanges([])}>
                        Disable All
                    </Button>
                    <Button variant={'secondary'} onClick={() => setEnabledExchanges(defaultEnabledExchanges)}>
                        Enable All
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default GeneralSettings
