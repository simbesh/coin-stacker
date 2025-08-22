const FAVICON_URL = 'https://www.google.com/s2/favicons?sz=64&domain='
const EXCHANGE_URLS: Record<string, string> = {
    binance: 'https://www.binance.com',
    bitaroo: 'https://www.bitaroo.com.au',
    btcmarkets: 'https://www.btcmarkets.net',
    coinjar: 'https://www.coinjar.com.au',
    coinjarAlt: 'https://exchange.coinjar.com/favicon.ico',
    coinspot: 'https://www.coinspot.com.au',
    digitalsurge: 'https://www.digitalsurge.com.au',
    independentreserve: 'https://www.independentreserve.com',
    kraken: 'https://www.kraken.com',
    liquid: 'https://www.liquid.com',
    luno: 'https://www.luno.com',
    swyftx: 'https://www.swyftx.com',
    coinstash: 'https://www.coinstash.com.au',
    cointree: 'https://www.cointree.com',
    okx: 'https://www.okx.com',
    hardblock: 'https://www.hardblock.com.au',
    day1x: 'https://www.day1x.io',
    // elbaite: 'https://www.elbaite.com',
}
const ALT_EXCHANGE_URLS: Record<string, string> = {
    coinjar: 'https://exchange.coinjar.com/assets/favicons/favicon.ico',
    swyftx: 'https://swyftx.com/favicon.ico',
    day1x: 'https://icons.duckduckgo.com/ip3/www.day1x.io.ico',
}

export function getExchangeLogo(name: string) {
    name = name.toLowerCase()
    return ALT_EXCHANGE_URLS[name] ?? FAVICON_URL + EXCHANGE_URLS[name]
}

export const EXCHANGE_COLOUR: Record<string, string> = {
    binance: '#f3ba2e',
    bitaroo: '#f67b0c',
    btcmarkets: '#4cfdc7',
    coinjar: '#3f65e3',
    coinspot: '#004fee',
    digitalsurge: '#8e6cd8',
    ftx: '#00b4c9',
    independentreserve: '#0c2c75',
    kraken: '#5d45dc',
    liquid: '#0055ff',
    luno: '#0091ff',
    day1x: '#1943c3',
}
