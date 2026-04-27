import type { PriceQueryParams } from '@/types/types'

interface MockBestResult {
    exchange: string
    feeRate: number
    fees: number
    grossAveragePrice: number
    grossPrice: number
    netCost: number
    netPrice: number
}

interface MockPriceQueryResult {
    best: MockBestResult[]
    errors: { error: { name?: string }; name: string }[]
}

export const mockQuery: PriceQueryParams = {
    side: 'buy',
    amount: '0.1',
    coin: 'BTC',
    quote: 'AUD',
}

export const mockData: MockPriceQueryResult = {
    best: [
        {
            exchange: 'independentreserve',
            netCost: 17_532.0,
            grossPrice: 174_950.0,
            netPrice: 174_987.0,
            grossAveragePrice: 174_950.0,
            fees: 37.0,
            feeRate: 0.005,
        },
        {
            exchange: 'kraken',
            netCost: 17_585.0,
            grossPrice: 175_200.0,
            netPrice: 175_265.0,
            grossAveragePrice: 175_200.0,
            fees: 65.0,
            feeRate: 0.004,
        },
        {
            exchange: 'coinjar',
            netCost: 17_642.0,
            grossPrice: 176_100.0,
            netPrice: 176_132.0,
            grossAveragePrice: 176_100.0,
            fees: 32.0,
            feeRate: 0.001,
        },
        {
            exchange: 'btcmarkets',
            netCost: 17_698.0,
            grossPrice: 175_800.0,
            netPrice: 175_918.0,
            grossAveragePrice: 175_800.0,
            fees: 118.0,
            feeRate: 0.0085,
        },
        {
            exchange: 'coinspot',
            netCost: 17_755.0,
            grossPrice: 177_200.0,
            netPrice: 177_235.0,
            grossAveragePrice: 177_200.0,
            fees: 35.0,
            feeRate: 0.001,
        },
        {
            exchange: 'digitalsurge',
            netCost: 17_812.0,
            grossPrice: 176_850.0,
            netPrice: 176_977.0,
            grossAveragePrice: 176_850.0,
            fees: 127.0,
            feeRate: 0.005,
        },
        {
            exchange: 'cointree',
            netCost: 17_868.0,
            grossPrice: 177_500.0,
            netPrice: 177_618.0,
            grossAveragePrice: 177_500.0,
            fees: 118.0,
            feeRate: 0.0075,
        },
        {
            exchange: 'swyftx',
            netCost: 17_925.0,
            grossPrice: 178_900.0,
            netPrice: 178_935.0,
            grossAveragePrice: 178_900.0,
            fees: 35.0,
            feeRate: 0.006,
        },
        {
            exchange: 'coinstash',
            netCost: 17_982.0,
            grossPrice: 179_100.0,
            netPrice: 179_172.0,
            grossAveragePrice: 179_100.0,
            fees: 72.0,
            feeRate: 0.0085,
        },
        {
            exchange: 'bitaroo',
            netCost: 17_831.0,
            grossPrice: 177_971.0,
            netPrice: 178_004.0,
            grossAveragePrice: 177_971.0,
            fees: 33.0,
            feeRate: 0.0064,
        },
        {
            exchange: 'hardblock',
            netCost: 17_945.0,
            grossPrice: 179_451.0,
            netPrice: 179_451.0,
            grossAveragePrice: 179_451.0,
            fees: 0.0,
            feeRate: 0.0128,
        },
        {
            exchange: 'luno',
            netCost: 18_294.0,
            grossPrice: 182_760.0,
            netPrice: 182_778.0,
            grossAveragePrice: 182_760.0,
            fees: 18.0,
            feeRate: 0.0325,
        },
        {
            exchange: 'okx',
            netCost: 17_794.0,
            grossPrice: 177_051.0,
            netPrice: 177_139.0,
            grossAveragePrice: 177_051.0,
            fees: 88.0,
            feeRate: 0.007,
        },
    ],
    errors: [],
}
