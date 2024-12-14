'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useLocalStorage } from '@uidotdev/usehooks'
import { LocalStorageKeys } from '@/lib/constants'
import { cn, defaultEnabledExchanges } from '@/lib/utils'
import ExchangeIcon from '@/components/ExchangeIcon'
import { Separator } from '@/components/ui/separator'
import Feedback from '@/components/Feedback'
import { Switch } from '@/components/ui/switch'
import { RiGithubLine } from 'react-icons/ri'

const GeneralSettings = () => {
    const [enabledExchanges, setEnabledExchanges] = useLocalStorage<Record<string, boolean>>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges
    )

    useEffect(() => {
        const defaultExchangeKeys = Object.keys(defaultEnabledExchanges)
        const currentExchangeKeys = Object.keys(enabledExchanges)
        const missingExchanges = defaultExchangeKeys.filter((x) => !currentExchangeKeys.includes(x))

        if (missingExchanges.length > 0) {
            setEnabledExchanges((prev) => ({
                ...prev,
                ...missingExchanges.reduce((acc, curr) => ({ ...acc, [curr]: defaultEnabledExchanges[curr] }), {}),
            }))
        }
    }, [enabledExchanges])

    function handleExchangeToggle(exchange: string) {
        setEnabledExchanges((prev) => {
            prev[exchange] = !prev[exchange]
            return prev
        })
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size={'icon'} variant={'ghost'}>
                    <Settings className={'size-5'} />
                </Button>
            </SheetTrigger>
            <SheetContent className={'overflow-y-auto'}>
                <SheetHeader>
                    <SheetTitle>General Settings</SheetTitle>
                    <SheetDescription>Toggle preferred exchanges.</SheetDescription>
                </SheetHeader>
                <div className={'mx-6 mt-6 space-y-1 sm:mx-10'}>
                    {Object.keys(defaultEnabledExchanges).map((exchange) => (
                        <Button
                            variant={'ghost'}
                            className={
                                'w-full justify-between hover:bg-transparent hover:ring-2 hover:ring-slate-200 dark:hover:ring-slate-800'
                            }
                            onClick={() => handleExchangeToggle(exchange)}
                            key={exchange + '-exchange-toggle'}
                            aria-label={`Toggle ${exchange} Exchange`}
                        >
                            <div
                                className={cn(
                                    'flex items-center gap-2',
                                    !enabledExchanges[exchange] && 'opacity-50 grayscale'
                                )}
                            >
                                <ExchangeIcon
                                    exchange={exchange}
                                    withLabel
                                    labelClassName={'font-semibold sm:text-base text-sm'}
                                />
                            </div>
                            <Switch size={'sm'} checked={enabledExchanges[exchange]} />
                        </Button>
                    ))}
                </div>
                <div className={'flex w-full justify-end gap-2 my-4'}>
                    <Button
                        variant={'secondary'}
                        aria-label={`Disable All Exchanges (${Object.keys(defaultEnabledExchanges).length})`}
                        onClick={() =>
                            setEnabledExchanges(
                                Object.fromEntries(Object.entries(defaultEnabledExchanges).map(([key]) => [key, false]))
                            )
                        }
                    >{`Disable All (${Object.keys(defaultEnabledExchanges).length})`}</Button>
                    <Button
                        variant={'secondary'}
                        aria-lable="Enable All Exchanges"
                        onClick={() => setEnabledExchanges(defaultEnabledExchanges)}
                    >
                        Enable All
                    </Button>
                </div>
                <Separator className={'mt-4'} />

                <div className={'flex items-center justify-end gap-2 text-muted-foreground/50 text-sm mt-2'}>
                    <div>{'v' + process.env.APP_VERSION}</div>
                    <div>{process.env.COMMIT_HASH}</div>
                </div>

                <div className={'mt-4 flex w-full justify-end'}>
                    <Feedback />
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default GeneralSettings
