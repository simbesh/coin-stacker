import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { HybridTooltip, HybridTooltipContent, HybridTooltipTrigger } from './hybrid-tooltip'

const informationIconVariants = cva('flex items-center justify-center rounded-md', {
    variants: {
        variant: {
            default: 'bg-primary/20',
            orderbook: 'bg-blue-500/20',
            broker: 'bg-wine-500/20',
            success: 'bg-green-500/20',
            warning: 'bg-yellow-500/20',
            destructive: 'bg-red-500/20',
            info: 'bg-blue-500/20',
        },
        size: {
            default: 'h-6 w-6',
            sm: 'h-5 w-5',
            lg: 'h-8 w-8',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
})

const iconColorVariants = cva('', {
    variants: {
        variant: {
            default: 'text-primary',
            orderbook: 'text-blue-500',
            broker: 'text-wine-600',
            success: 'text-green-500',
            warning: 'text-yellow-500',
            destructive: 'text-red-500',
            info: 'text-blue-500',
        },
        size: {
            default: 'size-4',
            sm: 'size-3',
            lg: 'size-5',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
})

const tooltipTextVariants = cva('text-sm text-center', {
    variants: {
        variant: {
            default: 'text-primary',
            orderbook: 'text-blue-500',
            broker: 'text-wine-600',
            success: 'text-green-500',
            warning: 'text-yellow-500',
            destructive: 'text-red-500',
            info: 'text-blue-500',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
})

export interface InformationIconProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof informationIconVariants> {
    icon: LucideIcon
    title?: string
    description?: string
    iconOffset?: string
    showTitleIcon?: boolean
}

const InformationIcon = React.forwardRef<HTMLDivElement, InformationIconProps>(
    ({ className, variant, size, icon: Icon, title, description, ...props }, ref) => {
        const content = (
            <div ref={ref} className={cn(informationIconVariants({ variant, size }), className)} {...props}>
                <Icon className={cn(iconColorVariants({ variant, size }))} />
            </div>
        )

        if (!title && !description) {
            return <div className="group flex items-center">{content}</div>
        }

        return (
            <div className="group flex items-center">
                <HybridTooltip>
                    <HybridTooltipTrigger>{content}</HybridTooltipTrigger>
                    <HybridTooltipContent>
                        {title && (
                            <div className="flex items-center gap-2 justify-center">
                                <Icon className={cn(iconColorVariants({ variant, size }))} />
                                <p className={cn(tooltipTextVariants({ variant }))}>{title}</p>
                            </div>
                        )}
                        {description && <p className="text-xs text-center whitespace-pre-line">{description}</p>}
                    </HybridTooltipContent>
                </HybridTooltip>
            </div>
        )
    }
)
InformationIcon.displayName = 'InformationIcon'

export { InformationIcon, informationIconVariants }
