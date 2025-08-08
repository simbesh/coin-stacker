export const exchanges = [
    'BTCMarkets',
    'IndependentReserve',
    // "Binance",
    'CoinJar',
    'CoinSpot',
    'Kraken',
    'Luno',
    'Bitaroo',
    'Swyftx',
]
export const exchangeConfig: Record<string, Record<string, string[]>> = {
    BTCMarkets: {
        markets: ['BTC/AUD', 'ETH/AUD', 'XRP/AUD', 'LTC/AUD', 'SOL/AUD', 'ADA/AUD'],
    },
    IndependentReserve: {
        markets: ['BTC/AUD', 'ETH/AUD', 'XRP/AUD', 'LTC/AUD', 'SOL/AUD', 'ADA/AUD', 'DOGE/AUD'],
    },
    // "Binance": {
    //     markets: [
    //         "BTC/AUD",
    //         "ETH/AUD"
    //     ]
    // }
    CoinJar: {
        markets: ['BTC/AUD', 'ETH/AUD', 'XRP/AUD', 'LTC/AUD', 'SOL/AUD', 'ADA/AUD', 'DOGE/AUD'],
    },
    CoinSpot: {
        markets: ['BTC/AUD', 'ETH/AUD', 'XRP/AUD', 'LTC/AUD', 'ADA/AUD', 'DOGE/AUD'],
    },
    Kraken: {
        markets: ['BTC/AUD', 'ETH/AUD', 'XRP/AUD', 'LTC/AUD'],
    },
    Luno: {
        markets: ['BTC/AUD', 'ETH/AUD', 'SOL/AUD', 'ADA/AUD'],
    },
    Bitaroo: {
        markets: ['BTC/AUD'],
    },
}

export const marketConfig: Record<string, string[]> = {}

Object.keys(exchangeConfig).forEach((exchange) => {
    exchangeConfig[exchange]?.markets?.forEach((market) => {
        if (!marketConfig[market]) {
            marketConfig[market] = []
        }
        marketConfig[market].push(exchange)
    })
})

export const markets = ['BTC/AUD', 'ETH/AUD', 'SOL/AUD', 'XRP/AUD', 'LTC/AUD', 'ADA/AUD', 'DOGE/AUD']
