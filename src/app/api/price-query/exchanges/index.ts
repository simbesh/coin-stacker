import { ExchangeHandler } from '../types'
import { getBitarooOrderBook } from './bitaroo'
import { getBTCMarketsOrderBook } from './btcmarkets'
import { getCoinJarOrderBook } from './coinjar'
import { getCoinSpotOrderBook } from './coinspot'
import { getCoinstashMockOrderBook } from './coinstash'
import { getCointreeMockOrderBook } from './cointree'
import { getDay1xOrderBook } from './day1x'
import { getDigitalSurgeMockOrderBook } from './digitalsurge'
import { getHardblockMockOrderBook } from './hardblock'
import { getIndependentReserveOrderBook } from './independentreserve'
import { getKrakenOrderBook } from './kraken'
import { getLunoOrderBook } from './luno'
import { getOkxOrderBook } from './okx'
import { getSwyftxMockOrderBook } from './swyftx'
import { getWayexOrderBook } from './wayex'

export const orderbookMethods: Record<string, ExchangeHandler> = {
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
    day1x: getDay1xOrderBook,
    wayex: getWayexOrderBook,
}

export const supportedExchanges = [
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
    'day1x',
    'wayex',
]
