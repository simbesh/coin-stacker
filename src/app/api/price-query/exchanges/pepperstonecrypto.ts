import { ExchangeHandler } from '../types'

export const getPepperstoneCryptoOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const symbol = `${base}/${quote}`

    // TODO: Replace with Pepperstone Crypto market data endpoint.
    // TODO: Add required auth headers/signature once API credentials flow is confirmed.
    // TODO: Add symbol mapping if PepperstoneCrypto uses a non-CCXT symbol format.
    // TODO: Parse the response into { bids, asks, timestamp, datetime, nonce }.
    // TODO: Throw MarketNotFoundError on 404-style unknown market responses.
    throw new Error(`TODO: PepperstoneCrypto API integration pending for ${symbol}`)
}
