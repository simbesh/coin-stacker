'use client'

import { Settings, Zap } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LocalStorageKeys } from '@/lib/constants'
import {
    Credenza,
    CredenzaClose,
    CredenzaContent,
    CredenzaDescription,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from './Credenza'
import ExchangeIcon from './ExchangeIcon'
import { MovingLabel } from './MovingLabel'
import { ScrollArea } from './ui/scroll-area'
import { TextShimmer } from './ui/text-shimmer'

interface WithdrawalFeeCredenzaProps {
    defaultOpen: boolean
}

const WithdrawalFeeCredenza = ({ defaultOpen }: WithdrawalFeeCredenzaProps) => {
    const { resolvedTheme } = useTheme()
    return (
        <Credenza
            defaultOpen={defaultOpen}
            onOpenChange={(open) => {
                if (!open) {
                    localStorage.setItem(LocalStorageKeys.BinanceAnnouncementDismissed, 'true')
                }
            }}
        >
            <CredenzaTrigger asChild>
                <MovingLabel
                    borderRadius="1.75rem"
                    className="inline-flex cursor-pointer items-center gap-2.5 border border-mono/15 bg-card text-foreground"
                    containerClassName=""
                    duration={3000}
                >
                    <span className="mx-2 flex items-center gap-2 md:hidden">
                        <Zap className="size-4 text-amber-500" />
                    </span>
                    <span className="mx-4 hidden items-center gap-2 md:flex lg:hidden">
                        New
                        <Zap className="size-4 text-amber-500" />
                    </span>
                    <span className="mx-4 hidden items-center gap-2 lg:flex">
                        New: Binance
                        <Zap className="size-4 text-amber-500" />
                    </span>
                </MovingLabel>
            </CredenzaTrigger>
            <CredenzaContent
                className="max-w-2xl bg-card p-6 transition-all duration-300"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <CredenzaHeader className="space-y-4 px-0 sm:px-4">
                    <div className="flex items-center gap-2">
                        <ExchangeIcon exchange="binance" imageClassName="size-6" />
                        <CredenzaTitle className="mx-auto block text-lg sm:hidden">New: Binance</CredenzaTitle>
                        <CredenzaTitle className="hidden text-xl sm:block">Binance Added!</CredenzaTitle>
                        <Badge
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                            variant="secondary"
                        >
                            <TextShimmer className="[--base-color:#d97706] dark:[--base-color:#f59e0b]" duration={1}>
                                NEW
                            </TextShimmer>
                        </Badge>
                    </div>

                    <CredenzaDescription className="space-y-4 text-left text-xs sm:text-base">
                        <div className="flex w-full justify-center">
                            <ExchangeIcon exchange="binance" imageClassName="size-12 sm:size-24 -my-2" />
                        </div>
                        <p className="leading-relaxed">
                            <strong>Binance</strong> is now available for price comparisons! As soon as the AUD markets
                            are live (expected soon: check{' '}
                            <a
                                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                href="https://x.com/Binance_AUS"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                x.com/Binance_AUS
                            </a>{' '}
                            for updates). Compare prices across even more exchanges to find the best deals.
                        </p>
                    </CredenzaDescription>
                </CredenzaHeader>
                <ScrollArea className="overflow-y-auto">
                    <div className="space-y-4">
                        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                            <h4 className="font-semibold text-foreground">Trading Fee:</h4>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 h-2 w-2 rounded-full bg-amber-500" />
                                    <span>
                                        Default fee is set to <strong>0.1%</strong> (standard Binance taker fee)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 h-2 w-2 rounded-full bg-green-500" />
                                    <span>
                                        If you have <strong>BNB fee payment enabled</strong>, edit your fee to{' '}
                                        <strong>0.075%</strong> for more accurate comparisons
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50">
                            <p className="flex items-center gap-2 text-blue-800 text-xs sm:text-sm dark:text-blue-200">
                                <Settings className="size-4 shrink-0" />
                                <span>
                                    <strong>Tip:</strong> Click the <strong>gear icon</strong> next to the exchange
                                    dropdown to customize your trading fees.
                                </span>
                            </p>
                            <div className="flex justify-center overflow-hidden rounded-lg">
                                <div className="w-1/2 overflow-hidden rounded-xl border">
                                    <Image
                                        alt="Edit fee settings"
                                        height={420}
                                        src={resolvedTheme === 'light' ? '/edit-fee-light.png' : '/edit-fee-dark.png'}
                                        width={840}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <CredenzaClose asChild>
                                <Button className="w-full sm:w-1/4">Got it!</Button>
                            </CredenzaClose>
                        </div>
                    </div>
                </ScrollArea>
            </CredenzaContent>
        </Credenza>
    )
}

export default WithdrawalFeeCredenza
