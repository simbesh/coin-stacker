import { luno } from 'ccxt'

async function tst() {
    const exchange = new luno({
        apiKey: process.env.LUNO_KEY,
        secret: process.env.LUNO_SECRET,
    })
    // const exchange = new binance({
    //     apiKey: process.env.BINANCE_KEY,
    //     secret: process.env.BINANCE_SECRET,
    // })
    await exchange.loadMarkets()
    await exchange.fetchCurrencies()

    console.log(exchange.currencies)
}

const dummyAddresses = {
    ETH: '0x0000000000000000000000000000000000000000',
    BTC: '3NqxbRaZyU9hv6wP7Wr5GPHyS5bhNZzFpw',
    XRP: 'r47bGjPxUWEdGmh9XhES4f2FUuDWEhxfbJ|||124',
    USDT: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
    SOL: '5aB7nyNJTuQZdKnhZXQHNhT16tBNevCuLRp14btvANxu',
}

// The only exception to this is XRP, which has a fixed 0.03% send fee.
async function tst2({ currency, amount }: { currency: string; amount: string }) {
    const address = dummyAddresses[currency as keyof typeof dummyAddresses]
    const exchange = new luno({
        apiKey: process.env.LUNO_KEY,
        secret: process.env.LUNO_SECRET,
    })
    await exchange.loadMarkets()
    let lunoCurrency = currency //exchange.currency(currency).id
    console.log('lunoCurrency', lunoCurrency)
    console.log('address', address)
    let signed = exchange.sign('/api/1/send_fee', 'private', 'GET')
    const response = await fetch(
        `https://api.luno.com/api/1/send_fee?amount=${amount}&currency=${lunoCurrency}&address=${address}`,
        { headers: signed.headers }
    )
    const data = await response.json()
    console.log(data)
    return Number(data.fee)
}

tst2({ currency: 'XRP', amount: '1' })
