'use client'

import { ScrollArea } from '@radix-ui/react-scroll-area'
import { useLocalStorage } from '@uidotdev/usehooks'
import { round } from 'lodash'
import { RotateCcw, Settings2 } from 'lucide-react'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { Credenza, CredenzaBody, CredenzaContent, CredenzaTrigger } from '@/components/Credenza'
import ExchangeIcon from '@/components/ExchangeIcon'
import ExchangeType from '@/components/ExchangeType'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { LocalStorageKeys } from '@/lib/constants'
import { useEnabledExchanges } from '@/lib/enabled-exchanges'
import { cn, defaultExchangeFees, exchangeTypes, formatExchangeName } from '@/lib/utils'

export function FeeParams() {
    const [open, setOpen] = useState(false)
    const [fees, setFees] = useLocalStorage<Record<string, number>>(LocalStorageKeys.ExchangeFees, defaultExchangeFees)
    const { enabledExchanges, setExchangeEnabled } = useEnabledExchanges()
    const exchangeFeeEntries: [string, number][] = Object.entries(defaultExchangeFees).map(([exchange, defaultFee]) => [
        exchange,
        fees[exchange] ?? defaultFee,
    ])

    useEffect(() => {
        const defaultExchangeKeys = Object.keys(defaultExchangeFees)
        const currentExchangeKeys = Object.keys(fees)
        const missingKeys = defaultExchangeKeys.filter((x) => !currentExchangeKeys.includes(x))
        const removedKeys = currentExchangeKeys.filter((x) => !defaultExchangeKeys.includes(x))

        if (missingKeys.length > 0 || removedKeys.length > 0) {
            const normalizedFees: Record<string, number> = {}

            for (const key of defaultExchangeKeys) {
                normalizedFees[key] = fees[key] ?? defaultExchangeFees[key] ?? 0
            }

            setFees(normalizedFees)
        }
    }, [fees, setFees])

    useEffect(() => {
        if (open) {
            posthog.capture('open-config-fees')
        }
    }, [open])

    return (
        <Credenza onOpenChange={setOpen} open={open}>
            <CredenzaTrigger asChild>
                <Button className={'bg-transparent'} size="icon" variant="outline">
                    <Settings2 className="size-[1.2rem]" />
                </Button>
            </CredenzaTrigger>
            <CredenzaContent className="w-full max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                <ScrollArea className="overflow-y-auto">
                    <CredenzaBody>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Exchange Fees</h4>
                                <p className="text-muted-foreground text-sm">
                                    Set your own fees if you are on a better tier.
                                </p>
                            </div>
                            <div className="grid gap-1">
                                {exchangeFeeEntries.map(([exchange, fee]) => {
                                    const isEnabled = enabledExchanges[exchange] ?? true

                                    return (
                                        <div
                                            className="grid grid-cols-[auto_minmax(0,1fr)_auto_7.5rem] items-center gap-3"
                                            key={`${exchange}-fee-input-key`}
                                        >
                                            <Switch
                                                aria-label={`Toggle ${formatExchangeName(exchange)} exchange`}
                                                checked={isEnabled}
                                                onCheckedChange={(checked) => setExchangeEnabled(exchange, checked)}
                                                size="sm"
                                            />
                                            <Button
                                                aria-label={`Toggle ${formatExchangeName(exchange)} exchange`}
                                                className={cn(
                                                    'h-auto justify-start gap-2 px-0 hover:bg-transparent hover:ring-2 hover:ring-slate-200 dark:hover:ring-slate-800',
                                                    !isEnabled && 'opacity-50 grayscale',
                                                )}
                                                onClick={() => setExchangeEnabled(exchange, !isEnabled)}
                                                variant="ghost"
                                            >
                                                <Label className="pointer-events-none flex min-w-0 items-center justify-start gap-2">
                                                    <ExchangeIcon exchange={exchange} />
                                                    {formatExchangeName(exchange)}
                                                </Label>
                                            </Button>
                                            <ExchangeType type={exchangeTypes[exchange]} />
                                            <div className={'flex items-center'}>
                                                <Input
                                                    className="h-8"
                                                    disabled={!isEnabled}
                                                    id={`${exchange}-fee-input`}
                                                    onChange={(e) =>
                                                        setFees((prev) => ({
                                                            ...prev,
                                                            [exchange]: round(Number(e.target.value) / 100, 4),
                                                        }))
                                                    }
                                                    pattern={'(^\\.*)+(^0*)+^\\d+(\\.\\d+)?'}
                                                    type={'number'}
                                                    value={round(fee * 100, 2)}
                                                />
                                                <Label className={'pointer-events-none -ml-10 px-3'}>%</Label>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <Button
                            aria-label="Reset fees to default"
                            className={'mt-4 w-full gap-2 bg-transparent'}
                            onClick={() => setFees(defaultExchangeFees)}
                            variant="outline"
                        >
                            <RotateCcw className="size-4" />
                            Reset to default
                        </Button>
                    </CredenzaBody>
                </ScrollArea>
            </CredenzaContent>
        </Credenza>
    )
}
