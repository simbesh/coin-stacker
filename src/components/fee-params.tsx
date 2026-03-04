'use client'

import { ScrollArea } from '@radix-ui/react-scroll-area'
import { useLocalStorage } from '@uidotdev/usehooks'
import { round } from 'lodash'
import { RotateCcw, Settings2 } from 'lucide-react'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { Credenza, CredenzaBody, CredenzaContent, CredenzaTrigger } from '@/components/Credenza'
import ExchangeIcon from '@/components/ExchangeIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocalStorageKeys } from '@/lib/constants'
import { defaultExchangeFees, formatExchangeName } from '@/lib/utils'

export function FeeParams() {
    const [open, setOpen] = useState(false)
    const [fees, setFees] = useLocalStorage<Record<string, number>>(LocalStorageKeys.ExchangeFees, defaultExchangeFees)

    useEffect(() => {
        const defaultExchangeKeys = Object.keys(defaultExchangeFees)
        const currentExchangeKeys = Object.keys(fees)
        const missingKeys = defaultExchangeKeys.filter((x) => !currentExchangeKeys.includes(x))

        if (missingKeys.length > 0) {
            const addedFees: Record<string, number> = {}
            for (const key of missingKeys) {
                addedFees[key] = defaultExchangeFees[key] ?? 0
            }

            setFees((prev) => ({
                ...prev,
                ...addedFees,
            }))
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
                            <div className="grid gap-2">
                                {Object.entries(fees).map(([exchange, fee]) => (
                                    <div
                                        className="grid grid-cols-9 items-center gap-4"
                                        key={`${exchange}-fee-input-key`}
                                    >
                                        <Label
                                            className={'col-span-5 flex items-center justify-start gap-2'}
                                            htmlFor={`${exchange}-fee-input`}
                                        >
                                            <ExchangeIcon exchange={exchange} />
                                            {formatExchangeName(exchange)}
                                        </Label>
                                        <div className={'col-span-4 flex items-center'}>
                                            <Input
                                                className="h-8"
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
                                ))}
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
