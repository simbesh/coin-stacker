'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, Zap } from 'lucide-react'
import { MovingLabel } from './MovingLabel'
import { TextShimmer } from './ui/text-shimmer'
import {
    Credenza,
    CredenzaTrigger,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaDescription,
    CredenzaClose,
} from './Credenza'
import { ScrollArea } from './ui/scroll-area'
import { LocalStorageKeys } from '@/lib/constants'
import ExchangeIcon from './ExchangeIcon'
import { useTheme } from 'next-themes'

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
                    duration={3000}
                    className="bg-card border border-mono/15 text-foreground inline-flex items-center gap-2.5 cursor-pointer"
                    containerClassName=""
                >
                    <span className="mx-2 flex items-center gap-2 md:hidden">
                        <Zap className="size-4 text-amber-500" />
                    </span>
                    <span className="mx-4 items-center gap-2 hidden md:flex lg:hidden">
                        New
                        <Zap className="size-4 text-amber-500" />
                    </span>
                    <span className="mx-4 items-center gap-2 hidden lg:flex">
                        New: Binance
                        <Zap className="size-4 text-amber-500" />
                    </span>
                </MovingLabel>
            </CredenzaTrigger>
            <CredenzaContent
                className="bg-card max-w-2xl p-6 transition-all duration-300"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <CredenzaHeader className="space-y-4 px-0 sm:px-4">
                    <div className="flex items-center gap-2">
                        <ExchangeIcon exchange="binance" size={24} />
                        <CredenzaTitle className="text-lg block sm:hidden mx-auto">New: Binance</CredenzaTitle>
                        <CredenzaTitle className="text-xl hidden sm:block">Binance Added!</CredenzaTitle>
                        <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        >
                            <TextShimmer duration={1} className="[--base-color:#d97706] dark:[--base-color:#f59e0b]">
                                NEW
                            </TextShimmer>
                        </Badge>
                    </div>

                    <CredenzaDescription className="text-left space-y-4 text-xs sm:text-base">
                        <div className="flex justify-center w-full">
                            <ExchangeIcon exchange="binance" imageClassName="size-12 sm:size-24 -my-2" />
                        </div>
                        <p className="leading-relaxed">
                            <strong>Binance</strong> is now available for price comparisons! As soon as the AUD markets
                            are live (expected soon: check{' '}
                            <a
                                href="https://x.com/Binance_AUS"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                            >
                                x.com/Binance_AUS
                            </a>{' '}
                            for updates). Compare prices across even more exchanges to find the best deals.
                        </p>
                    </CredenzaDescription>
                </CredenzaHeader>
                <ScrollArea className="overflow-y-auto">
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <h4 className="font-semibold text-foreground">Trading Fee:</h4>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5"></div>
                                    <span>
                                        Default fee is set to <strong>0.1%</strong> (standard Binance taker fee)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                    <span>
                                        If you have <strong>BNB fee payment enabled</strong>, edit your fee to{' '}
                                        <strong>0.075%</strong> for more accurate comparisons
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                            <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm flex items-center gap-2">
                                <Settings className="size-4 shrink-0" />
                                <span>
                                    <strong>Tip:</strong> Click the <strong>gear icon</strong> next to the exchange
                                    dropdown to customize your trading fees.
                                </span>
                            </p>
                            <div className="flex justify-center rounded-lg overflow-hidden">
                                <div className="rounded-xl overflow-hidden border w-1/2">
                                    <img
                                        src={resolvedTheme === 'light' ? '/edit-fee-light.png' : '/edit-fee-dark.png'}
                                        alt="Edit fee settings"
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
