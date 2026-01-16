export enum LocalStorageKeys {
    PriceQueryHistory = 'cs-price-query-history',
    ExchangeFees = 'cs-user-exchange-fees',
    EnabledExchanges = 'cs-user-enabled-exchanges-v2',
    IncludeWithdrawalFees = 'cs-include-withdrawal-fees-v2',
    WithdrawalFeeDialogDismissed = 'cs-withdrawal-fee-dialog-dismissed',
}

export const getAfiliateOrTradeUrl = (exchange: string, base: string, quote: string) => {
    return affiliateUrl(exchange, base, quote) ?? tradeUrl(exchange, base, quote)
}

const tradeUrl = (exchange: string, base: string, quote: string) => {
    switch (exchange) {
        case 'coinjar':
            return 'https://exchange.coinjar.com/trade'
        case 'btcmarkets':
            return `https://app.btcmarkets.net/buy-sell?market=${base}-${quote}`
        case 'independentreserve':
            return `https://portal.independentreserve.com/buy/${base}`
        // case "Binance":
        //     return `https://www.binance.com/en/trade/${base}_${quote}`
        case 'coinjar':
            return 'https://exchange.coinjar.com/trade'
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
        case 'coinstash':
            return `https://coinstash.com.au/trade`
        case 'day1x':
            return `https://exchange.day1x.io/exchange`
        case 'wayex':
            return `https://www.wayex.com/trade`
        // case 'elbaite':
        //     return 'https://www.elbaite.com/'
        default:
            return ``
    }
}

const affiliateUrl = (exchange: string, base: string, quote: string) => {
    switch (exchange) {
        case 'binance':
            return `https://www.binance.com/en/trade/${base}_${quote}?ref=123456`
        case 'coinjar':
            return `https://cjr.io/ASfU`
        case 'btcmarkets':
            return `https://app.btcmarkets.net/buy-sell?market=${base}-${quote}`
        case 'independentreserve':
            return `https://portal.independentreserve.com/invite/BTMGWY`
        // case "Binance":
        //     return `https://www.binance.com/en/trade/${base}_${quote}`
        case 'coinspot':
            return `https://www.coinspot.com.au?affiliate=8XXR9B`
        // return `https://www.coinspot.com.au/join/REFJTP345`
        case 'kraken':
            return `https://kraken.pxf.io/XmY53M`
        case 'luno':
            return `https://www.luno.com/invite/EUBQ4W`
        case 'bitaroo':
            return `https://trade.bitaroo.com.au/`
        case 'swyftx':
            return `https://trade.swyftx.com/register/?ref=simonbechard`
        case 'coinstash':
            return `https://coinstash.com.au?a=6ta6yw2g`
        case 'digitalsurge':
            return `https://digitalsurge.com.au/?ref=KDXQ4`
        case 'okx':
            return `https://okx.com/join/95847721`
        case 'cointree':
            return `https://www.cointree.com?r=12C3C211-46A4-430B-B3A1-36028E9FF9F8`
        case 'hardblock':
            return `https://www.hardblock.com.au/join/2da97d02`
        case 'day1x':
            return `https://day1x.io/?refcode=83277`
        case 'wayex':
            return 'https://my.wayex.com/sign-up?aff=SIMONB'
        default:
            return undefined
    }
}

export const markets = [
    'BTC',
    'ETH',
    'SOL',
    'USDT',
    'XRP',
    'ADA',
    'LTC',
    'DOGE',
    ...[
        'LINK',
        'USDC',
        'AAVE',
        'BAT',
        'BCH',
        'COMP',
        'DOT',
        'SAND',
        'UNI',
        'XLM',
        'EOS',
        'MATIC',
        'ALGO',
        'AVAX',
        'ENJ',
        'ETC',
        'MANA',
        'OMG',
        'POWR',
        'DAI',
        'GRT',
        'MKR',
        'SNX',
        'YFI',
        'ZRX',
        'EUR',
        'XTZ',
        'TRUMP',
        'SUI',
        'HYPE',
    ].sort(),
]
