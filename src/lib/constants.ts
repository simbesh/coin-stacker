export enum LocalStorageKeys {
    PriceQueryHistory = 'cs-price-query-history',
    ExchangeFees = 'cs-user-exchange-fees',
    EnabledExchanges = 'cs-user-enabled-exchanges',
}
export const exchangeLinks = {
    coinjar: 'https://exchange.coinjar.com/trade',
    BTCMarkets: '',
    IndependentReserve: '',
    // "Binance": ',
    CoinJar: '',
    CoinSpot: '',
    Kraken: '',
    Luno: '',
    Bitaroo: '',
    Swyftx: '',
}

export const getExchangeUrl = (exchange: string, base: string, quote: string) => {
    switch (exchange) {
        case 'coinjar':
            return `https://exchange.coinjar.com/trade`
        case 'btcmarkets':
            return `https://app.btcmarkets.net/buy-sell?market=${base}-${quote}`
        case 'independentreserve':
            return `https://portal.independentreserve.com/buy/${base}`
        // case "Binance":
        //     return `https://www.binance.com/en/trade/${base}_${quote}`
        case 'coinjar':
            return `https://exchange.coinjar.com/trade`
        case 'coinspot':
            return `https://www.coinspot.com.au/trade/${base}`
        case 'kraken':
            return `https://pro.kraken.com/app/trade/${base}-${quote}`
        case 'luno':
            return `https://www.luno.com/trade/markets/${base}${quote}`
        case 'bitaroo':
            return `https://trade.bitaroo.com.au/`
        case 'swyftx':
            return `https://trade.swyftx.com/trade`
        default:
    }
}
