'use client'

import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Coin from '@/components/CoinIcon'
import { exchangeConfig, exchanges, marketConfig, markets } from '@/lib/exchange-config'
import ExchangeIcon from '@/components/ExchangeIcon'

export default function HomePage() {
    const [selectedExchange, setSelectedExchange] = useState<string>()
    const [selectedCoin, setSelectedCoin] = useState<string>()
    const [availableMarkets, setAvailableMarkets] = useState<string[]>()
    const [availableExchanges, setAvailableExchanges] = useState<string[]>()

    useEffect(() => {
        if (selectedExchange) {
            setAvailableMarkets(exchangeConfig[selectedExchange]?.markets)
        }
    }, [selectedExchange])

    useEffect(() => {
        if (selectedCoin) {
            setAvailableExchanges(marketConfig[selectedCoin])
        }
    }, [selectedCoin])

    return (
        <div className={'mt-4 flex flex-col gap-1 bg-slate-800 p-1'}>
            <div id="exchange-selection" className={'flex flex-wrap gap-2 bg-slate-800'}>
                {exchanges.map((exchange) => (
                    <Button
                        variant={'secondary'}
                        onClick={() => setSelectedExchange(exchange)}
                        disabled={availableExchanges?.includes(exchange) === false}
                        aria-label={`Select ${exchange} Exchange`}
                        className={cn(
                            selectedExchange === exchange
                                ? 'border-white'
                                : 'border-transparent !bg-slate-800 !text-gray-400',
                            'flex gap-2 border-2 capitalize disabled:opacity-30 disabled:grayscale'
                        )}
                    >
                        <ExchangeIcon exchange={exchange} withLabel />
                    </Button>
                ))}
            </div>
            <div id="coin-selection" className={'flex flex-wrap gap-2 bg-slate-800'}>
                {markets.map((market) => (
                    <Button
                        variant={'secondary'}
                        onClick={() => setSelectedCoin(market)}
                        disabled={availableMarkets?.includes(market) === false}
                        aria-label={`Select ${market} Market`}
                        className={cn(
                            selectedCoin === market
                                ? 'border-white'
                                : 'border-transparent !bg-slate-800 !text-gray-400',
                            'flex gap-2 border-2 capitalize disabled:opacity-30 disabled:grayscale'
                        )}
                    >
                        <Coin symbol={market} />
                        {market}
                    </Button>
                ))}
            </div>
        </div>
    )
}
