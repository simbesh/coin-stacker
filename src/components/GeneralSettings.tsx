'use client'

import { useLocalStorage } from '@uidotdev/usehooks'
import { Settings } from 'lucide-react'
import { useEffect } from 'react'
import ExchangeIcon from '@/components/ExchangeIcon'
import Feedback from '@/components/Feedback'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { LocalStorageKeys } from '@/lib/constants'
import { cn, defaultEnabledExchanges } from '@/lib/utils'

const GeneralSettings = () => {
    const [enabledExchanges, setEnabledExchanges] = useLocalStorage<Record<string, boolean>>(
        LocalStorageKeys.EnabledExchanges,
        defaultEnabledExchanges,
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
                            aria-label={`Toggle ${exchange} Exchange`}
                            className={
                                'w-full justify-between hover:bg-transparent hover:ring-2 hover:ring-slate-200 dark:hover:ring-slate-800'
                            }
                            key={exchange + '-exchange-toggle'}
                            onClick={() => handleExchangeToggle(exchange)}
                            variant={'ghost'}
                        >
                            <div
                                className={cn(
                                    'flex items-center gap-2',
                                    !enabledExchanges[exchange] && 'opacity-50 grayscale',
                                )}
                            >
                                <ExchangeIcon
                                    exchange={exchange}
                                    labelClassName={'font-semibold sm:text-base text-sm'}
                                    withLabel
                                />
                            </div>
                            <Switch checked={enabledExchanges[exchange]} size={'sm'} />
                        </Button>
                    ))}
                </div>
                <div className={'my-4 flex w-full justify-end gap-2'}>
                    <Button
                        aria-label={`Disable All Exchanges (${Object.keys(defaultEnabledExchanges).length})`}
                        onClick={() =>
                            setEnabledExchanges(
                                Object.fromEntries(
                                    Object.entries(defaultEnabledExchanges).map(([key]) => [key, false]),
                                ),
                            )
                        }
                        variant={'secondary'}
                    >{`Disable All (${Object.keys(defaultEnabledExchanges).length})`}</Button>
                    <Button
                        aria-lable="Enable All Exchanges"
                        onClick={() => setEnabledExchanges(defaultEnabledExchanges)}
                        variant={'secondary'}
                    >
                        Enable All
                    </Button>
                </div>
                <Separator className={'mt-4'} />

                <div className={'mt-2 flex items-center justify-end gap-2 text-muted-foreground/50 text-sm'}>
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
