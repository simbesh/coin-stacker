import { BookOpenText, HandCoins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HybridTooltip, HybridTooltipContent, HybridTooltipTrigger } from './ui/hybrid-tooltip'

interface ExchangeTypeProps {
    type?: 'orderbook' | 'broker'
}

const ExchangeType = ({ type }: ExchangeTypeProps) => {
    if (!type) return null
    return (
        <div className="group flex items-center">
            <HybridTooltip>
                <HybridTooltipTrigger>
                    <div
                        className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-md',
                            type === 'orderbook' ? 'bg-blue-500/20' : 'bg-wine-500/20'
                        )}
                    >
                        {type === 'orderbook' ? (
                            <BookOpenText className="size-4 mt-0.5 text-blue-500 " />
                        ) : (
                            <HandCoins className="size-4 text-wine-600" />
                        )}
                    </div>
                </HybridTooltipTrigger>
                <HybridTooltipContent>
                    <p className={cn('text-sm text-center', type === 'orderbook' ? 'text-blue-500' : 'text-wine-600')}>
                        {type === 'orderbook' ? 'Order Book Exchange' : 'Broker Exchange'}
                    </p>
                    <p className="text-xs text-center">
                        {type === 'orderbook'
                            ? 'Prices are set by the market (users)'
                            : 'Prices are set by the exchange'}
                    </p>
                </HybridTooltipContent>
            </HybridTooltip>
        </div>
    )
}

export default ExchangeType
