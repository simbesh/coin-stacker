import Image from 'next/image'
import type { HTMLAttributes } from 'react'
import { EXCHANGE_LOGO_BACKGROUNDS, getExchangeLogo } from '@/exchange-config'
import { cn, formatExchangeName } from '@/lib/utils'

interface ExchangeIconProps extends HTMLAttributes<HTMLDivElement> {
    exchange: string
    hideLabelMobile?: boolean
    imageClassName?: string
    isLoading?: boolean
    labelClassName?: string
    withLabel?: boolean
}

const ExchangeIcon = ({
    exchange,
    withLabel,
    className,
    labelClassName,
    imageClassName,
    isLoading,
    hideLabelMobile = false,
    ...props
}: ExchangeIconProps) => {
    const logoBackground = EXCHANGE_LOGO_BACKGROUNDS[exchange.toLowerCase()]
    const invertColour = {
        'invert-0': ['swyftx'].includes(exchange),
    }
    return (
        <div className={cn('flex min-w-fit items-center gap-2', className)} {...props}>
            {isLoading ? null : (
                <Image
                    alt={`exchange logo for ${exchange}`}
                    className={cn(
                        'my-0.5 size-5 items-center rounded-sm',
                        logoBackground && 'p-[2px]',
                        invertColour,
                        imageClassName,
                    )}
                    height={20}
                    src={getExchangeLogo(exchange)}
                    style={logoBackground ? { backgroundColor: logoBackground } : undefined}
                    unoptimized
                    width={20}
                />
            )}
            <span className={cn('w-fit', labelClassName, hideLabelMobile && 'hidden sm:block')}>
                {withLabel && formatExchangeName(exchange)}
            </span>
        </div>
    )
}

export default ExchangeIcon
