import type { ExchangeHandler } from '../types'
import { getBinanceOrderBook } from './binance'
import { getBitarooOrderBook } from './bitaroo'
import { getBTCMarketsOrderBook } from './btcmarkets'
import { getCoinJarOrderBook } from './coinjar'
import { getCoinSpotOrderBook } from './coinspot'
import { getCoinstashMockOrderBook } from './coinstash'
import { getCointreeMockOrderBook } from './cointree'
import { getDigitalSurgeMockOrderBook } from './digitalsurge'
import { getHardblockMockOrderBook } from './hardblock'
import { getIndependentReserveOrderBook } from './independentreserve'
import { getKrakenOrderBook } from './kraken'
import { getLunoOrderBook } from './luno'
import { getOkxOrderBook } from './okx'
import { getPepperstoneCryptoOrderBook } from './pepperstonecrypto'
import { getSwyftxMockOrderBook } from './swyftx'
import { getWayexOrderBook } from './wayex'

export const orderbookMethods: Record<string, ExchangeHandler> = {
    binance: getBinanceOrderBook,
    btcmarkets: getBTCMarketsOrderBook,
    independentreserve: getIndependentReserveOrderBook,
    kraken: getKrakenOrderBook,
    luno: getLunoOrderBook,
    coinspot: getCoinSpotOrderBook,
    coinjar: getCoinJarOrderBook,
    bitaroo: getBitarooOrderBook,
    swyftx: getSwyftxMockOrderBook,
    coinstash: getCoinstashMockOrderBook,
    cointree: getCointreeMockOrderBook,
    digitalsurge: getDigitalSurgeMockOrderBook,
    okx: getOkxOrderBook,
    hardblock: getHardblockMockOrderBook,
    wayex: getWayexOrderBook,
    pepperstonecrypto: getPepperstoneCryptoOrderBook,
}

export const supportedExchanges = [
    'binance',
    'btcmarkets',
    'independentreserve',
    'kraken',
    'luno',
    'coinspot',
    'coinjar',
    'bitaroo',
    'swyftx',
    'coinstash',
    'cointree',
    'digitalsurge',
    'okx',
    'hardblock',
    'wayex',
    'pepperstonecrypto',
]
