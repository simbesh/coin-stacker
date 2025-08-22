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

                        <div className="flex justify-center rounded-lg overflow-hidden drop-shadow-lg dark:drop-shadow-slate-500/20">
                            <div className="rounded-2xl overflow-hidden dark:border scale-75 -my-2">
                                {resolvedTheme === 'light' ? (
                                    <img src="data:image/jpeg;base64,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" />
                                ) : (
                                    <img src="data:image/jpeg;base64,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" />
                                )}
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
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
