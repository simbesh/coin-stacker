import React from 'react'
import { getExchangeLogo } from '@/exchange-config'
import { cn, formatExchangeName } from '@/lib/utils'

const ExchangeIcon = ({ exchange, withLabel, className }: string | any) => {
    const invertColour = {
        'invert-0 dark:invert': ['swyftx'].includes(exchange),
    }
    return (
        <>
            <img
                alt={`exchange logo for ${exchange}`}
                src={getExchangeLogo(exchange)}
                className={cn('icon-md my-0.5 items-center rounded-sm', invertColour, className)}
            />
            {withLabel && formatExchangeName(exchange)}
        </>
    )
}

export default ExchangeIcon
