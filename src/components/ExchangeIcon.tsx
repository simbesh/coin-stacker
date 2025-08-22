import React from 'react'
import { getExchangeLogo } from '@/exchange-config'
import { cn, formatExchangeName } from '@/lib/utils'

const ExchangeIcon = ({
    exchange,
    withLabel,
    className,
    labelClassName,
    imageClassName,
    isLoading,
    hideLabelMobile = false,
    ...props
}: string | any) => {
    const invertColour = {
        'invert-0': ['swyftx'].includes(exchange),
    }
    return (
        <div className={cn('flex min-w-fit items-center gap-2', className)} {...props}>
            {isLoading ? (
                <></>
            ) : (
                <img
                    alt={`exchange logo for ${exchange}`}
                    src={getExchangeLogo(exchange)}
                    className={cn('my-0.5 size-5 items-center rounded-sm', invertColour, imageClassName)}
                />
            )}
            <span className={cn('w-fit', labelClassName, hideLabelMobile && 'hidden sm:block')}>
                {withLabel && formatExchangeName(exchange)}
            </span>
        </div>
    )
}

export default ExchangeIcon
