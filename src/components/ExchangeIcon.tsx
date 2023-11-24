import React from 'react'
import { getExchangeLogo } from '@/exchange-config'
import { cn } from '@/lib/utils'

const ExchangeIcon = ({ exchange, className }: string | any) => {
    return (
        <img
            alt={`exchange logo for ${exchange}`}
            src={getExchangeLogo(exchange)}
            className={cn('icon-md my-0.5 items-center rounded-sm', className)}
        />
    )
}

export default ExchangeIcon
