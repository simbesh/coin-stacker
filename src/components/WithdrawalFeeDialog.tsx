'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OctagonAlert, PartyPopper, Pin, TrendingUpDown, Zap } from 'lucide-react'
import { MovingLabel } from './MovingLabel'
import { InformationIcon } from './ui/information-icon'
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

interface WithdrawalFeeCredenzaProps {
    defaultOpen: boolean
}

const WithdrawalFeeCredenza = ({ defaultOpen }: WithdrawalFeeCredenzaProps) => {
    return (
        <Credenza
            defaultOpen={defaultOpen}
            onOpenChange={(open) => {
                if (!open) {
                    localStorage.setItem(LocalStorageKeys.WithdrawalFeeDialogDismissed, 'true')
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
                        New: Withdrawal Fees
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
                        <Zap className="size-6 text-amber-500" />
                        <CredenzaTitle className="text-lg block sm:hidden mx-auto">New: Withdrawal Fees</CredenzaTitle>
                        <CredenzaTitle className="text-xl hidden sm:block">New Feature: Withdrawal Fees</CredenzaTitle>
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
                        <p className="leading-relaxed">
                            We&apos;ve added <strong>withdrawal fees</strong> to help you see the complete cost of your
                            trades! Now you can toggle to include withdrawal fees when comparing exchange prices.
                        </p>
                    </CredenzaDescription>
                </CredenzaHeader>
                <ScrollArea className="overflow-y-auto">
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <h4 className="font-semibold text-foreground">What&apos;s included:</h4>
                            <ul className="space-y-2 text-xs sm:text-sm">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Real-time withdrawal fees from exchange APIs where available
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Toggle on/off to compare prices with or without withdrawal costs
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    Clear indicators showing fee types for each exchange
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3 text-xs sm:text-sm">
                            <h4 className="font-semibold text-foreground">Fee Types:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <InformationIcon icon={TrendingUpDown} variant="info" size="sm" />
                                    <span>
                                        <strong className="text-blue-500">Dynamic:</strong> Live from exchange APIs
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <InformationIcon icon={Pin} variant="warning" size="sm" />
                                    <span>
                                        <strong className="text-yellow-500">Static:</strong> Fixed fees (may be
                                        outdated)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <InformationIcon icon={PartyPopper} variant="success" size="sm" />
                                    <span>
                                        <strong className="text-green-500">Free:</strong> No withdrawal fees
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <InformationIcon icon={OctagonAlert} variant="destructive" size="sm" />
                                    <span>
                                        <strong className="text-red-500">Estimated:</strong> Based on median of other
                                        exchanges
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
                                <strong>💡 Tip:</strong> Look for the &ldquo;Withdrawal Fee&rdquo; toggle in the
                                top-right of the results table to include these fees in your price comparisons.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <CredenzaClose asChild>
                                <Button className="w-full sm:w-1/4">Got it, thanks!</Button>
                            </CredenzaClose>
                        </div>
                    </div>
                </ScrollArea>
            </CredenzaContent>
        </Credenza>
    )
}

export default WithdrawalFeeCredenza
