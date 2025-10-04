import { coinstashWithdrawFees } from '@/lib/constants/coinstash-withdraw-fees'
import { swyftxWithdrawFees } from '@/lib/constants/swyftx-withdraw-fees'
import { luno, okx } from 'ccxt'
import { NextRequest, NextResponse } from 'next/server'

// Cache for 24 hours (86400 seconds)
export const revalidate = 86400

// Mock withdrawal fees data - in production, this would come from an external API
const withdrawalFees: Record<string, Record<string, number>> = {
    bitaroo: {
        BTC: 0.00001,
    },
    hardblock: {
        BTC: 0.00000204,
    },
    coinspot: {
        AGLD: 1.88,
        STPT: 18,
        SCR: 0.2,
        UGX: 0,
        NEAR: 0.018,
        AUDIO: 20,
        WLD: 1.37,
        ETHFI: 1.19,
        FARM: 0.044,
        SDG: 0,
        DGB: 0.004,
        AVAOLD: 0.61,
        WING: 0.0035,
        BCH: 0.0002,
        AI: 0.14,
        JST: 50,
        HOT: 1334,
        AR: 0,
        SEI: 0.4,
        SEK: 0,
        BB: 0.05,
        A: 0.081,
        QAR: 0,
        C: 0.084,
        JTO: 0.36,
        D: 0.52,
        FLM: 0.5,
        G: 112,
        FLR: 0.1,
        BIGTIME: 23,
        S: 0.004,
        T: 79,
        LYD: 0,
        W: 8.05,
        SFP: 0.037,
        DIA: 1.91,
        ARDR: 2,
        JUP: 1.31,
        BEL: 5.09,
        JUV: 0,
        WOO: 0.23,
        '1MBABYDOGE': 1047,
        BLUR: 16,
        STRK: 1,
        HRK: 0,
        DF: 44,
        WAVES: 0,
        PGALA: 72,
        FLOKI: 12778,
        SAND: 4.64,
        DKK: 0,
        BGN: 0,
        UMA: 0.84,
        FOR: 1678,
        SCRT: 0.1,
        TUSD: 3,
        COOKIE: 0.13,
        MUBARAK: 0.53,
        BHD: 0,
        IDRT: 20793,
        OAX: 95,
        HARD: 0,
        BTCDOWN: 0,
        UNI: 0.12,
        HUF: 0,
        WRX: 0.23,
        ETHDOWN: 0,
        GO: 1,
        BIO: 7.33,
        SKL: 37,
        WTC: 0.01,
        SLF: 0.01,
        FLOW: 0.0001,
        SLP: 732,
        NXPC: 0.022,
        ID: 0.11,
        DOP: 0,
        IO: 1.03,
        IQ: 50,
        WRXOLD: 4,
        DOT: 0.08,
        '1INCH': 5.14,
        MAD: 0,
        TURBO: 156,
        UNFI: 0,
        FTM: 0.002,
        POWR: 8.02,
        MAV: 23,
        FTT: 1.39,
        BEAMX: 2.3,
        ARKM: 2.51,
        ATOM: 0.02,
        QUICK: 0.27,
        PENDLE: 0.23,
        BLZ: 34,
        MBL: 4.9,
        SNT: 0,
        SNS: 746,
        SNX: 1.96,
        FUN: 134,
        API3: 0.85,
        QKC: 185,
        BMT: 0.24,
        ROSE: 0.1,
        PORTAL: 30,
        SOL: 0.001,
        CITY: 0,
        LA: 3.63,
        BNC: 0.1,
        OGN: 17,
        CGPT: 0.19,
        CELR: 160,
        BNB: 0.00001,
        BND: 0,
        CELO: 0.003,
        AUCTION: 0.13,
        LAYER: 1.14,
        MANTA: 0.15,
        BADGER: 0,
        TUSDOLD: 0.017,
        MULTI: 0.031,
        CETUS: 0.5,
        BNT: 1.65,
        UTK: 40,
        BNX: 0.0095,
        SPK: 0.24,
        MDL: 0,
        ME: 0.95,
        MDT: 45,
        AERGO: 0,
        BDOT: 0,
        PLUME: 15,
        EGLD: 0.0008,
        TRUMP: 0.075,
        PUNDIX: 4.37,
        FXS: 0.47,
        AEVO: 13,
        FLUX: 6.32,
        TORN: 0,
        QNT: 0.012,
        OG: 0,
        OM: 0.01,
        ETHW: 0.004,
        AEUR: 1.14,
        OP: 0.06,
        WETH: 0.0003,
        SSV: 0.15,
        BUSD: 5,
        ARPA: 56,
        BRL: 0,
        ALCX: 0.13,
        STG: 7.49,
        SHIB: 102762,
        IOTX: 0.12,
        KDA: 0,
        FRONT: 6.35,
        ZAR: 0,
        QUICKOLD: 0.16,
        STO: 14,
        STX: 1,
        QI: 13,
        MBOX: 0.29,
        IOST: 0.0001,
        SUI: 0.06,
        XUSD: 1.27,
        BSW: 0.63,
        CAKE: 0.0064,
        OMG: 0,
        SUN: 6,
        TRXOLD: 0.24,
        UYU: 0,
        BTC: 0.00003,
        IOTA: 0.06,
        REEF: 10,
        AIXBT: 3.56,
        OMR: 0,
        KES: 0,
        RONIN: 0.01,
        KEY: 0,
        BTS: 0,
        ONE: 0.1,
        RENDER: 0.18,
        ONG: 0.1,
        ANKR: 87,
        ALGO: 0.008,
        UZS: 0,
        SC: 0.1,
        ONT: 1,
        DYM: 0.004,
        PIVX: 0.04,
        A2Z: 235,
        HYPER: 0,
        DZD: 0,
        MKR: 0.00079,
        KGS: 0,
        DODO: 29,
        ICP: 0.0003,
        ZEC: 0.01,
        RESOLV: 8.43,
        XAF: 0,
        ICX: 0.02,
        KMNO: 11,
        XAI: 4.44,
        ZEN: 0.05,
        KP3R: 0,
        DUSK: 0.26,
        DOGE: 4,
        ALPHA: 88,
        SXP: 0.1,
        HBAR: 0.06,
        MLN: 0.15,
        SXT: 16,
        PEPE: 122296,
        KHR: 0,
        IDR: 0,
        DOGS: 100,
        CTSI: 15,
        OSMO: 0.06,
        SHELL: 0.13,
        C98: 25,
        NTRN: 0.25,
        SYN: 9.48,
        MMK: 0,
        VIDT: 0,
        SYS: 1,
        GAL: 1.29,
        GAS: 0.005,
        BOME: 353,
        COMBO: 0,
        THETA: 0.14,
        NEXO: 0.98,
        PERL: 1000,
        ORN: 4.37,
        AAVE: 0.0042,
        MNT: 0,
        GBP: 0,
        BONK: 18289,
        BYN: 0,
        PERP: 4.78,
        BICO: 12,
        NEWT: 4.32,
        HMSTR: 141,
        XEC: 280,
        PEOPLE: 66,
        ZIL: 1,
        VAI: 0.017,
        XEM: 0,
        KEYFI: 17,
        CTXC: 0,
        BIDR: 285,
        OOKI: 0,
        KMD: 0.002,
        EPIC: 0.47,
        GEL: 0,
        ZK: 0.1,
        USUAL: 19,
        KNC: 3.33,
        PROS: 0.2,
        HUMA: 21,
        PROM: 0.14,
        CATI: 1.15,
        BGBP: 2.81,
        GFT: 3.18,
        BIFI: 0.0068,
        PORTO: 0.015,
        OPUSDCE: 0.043,
        WAXP: 0.2,
        DOOD: 5.65,
        TAO: 0.0003,
        MTL: 0.1,
        VET: 3,
        USDT: 1,
        OXT: 23,
        USDP: 3,
        ILS: 0,
        ILV: 0.084,
        GHS: 0,
        EDU: 0.13,
        CAD: 0,
        LUMIA: 0.001,
        USD1: 2.5,
        CAN: 5,
        CREAM: 0,
        IMX: 2.39,
        TREE: 3.99,
        USDC: 1,
        TCT: 3217,
        INJ: 0.01,
        PARA: 10,
        VGX: 0,
        TRIBE: 0,
        EFI: 27,
        KERNEL: 5.87,
        '1000SATS': 100000,
        XLM: 0.005,
        SUPER: 2.02,
        EIGEN: 0.97,
        KSM: 0.01,
        ANIME: 77,
        VIB: 1400,
        GALA: 80,
        EGP: 0,
        VIC: 0.001,
        RAD: 1.88,
        MOVE: 10,
        MOVR: 0.003,
        XMR: 0,
        MXN: 0,
        MATICUSDCE: 0.0064,
        GLM: 5.29,
        RAY: 0.2,
        FDUSD: 0.02,
        ZRO: 0.67,
        XNO: 0.041,
        NPXS: 14223,
        VELODROME: 0.84,
        ZRX: 5.26,
        SANTOS: 0.0073,
        WNXM: 0.022,
        XOF: 0,
        GMT: 15,
        IRIS: 0,
        GMX: 0.014,
        RCN: 3577,
        OMNI: 0.34,
        GNO: 0.0099,
        VITE: 1,
        GNS: 0.0031,
        VANRY: 43,
        THE: 0.043,
        CFX: 0.002,
        KWD: 0,
        ACA: 0.2,
        ISK: 0,
        ACE: 0.032,
        ACH: 62,
        MINA: 0.9,
        ACM: 0,
        VTHO: 70,
        TIA: 0.1,
        PAB: 0,
        RED: 3.31,
        ACT: 16,
        ACX: 7.42,
        REI: 0.03,
        REN: 0,
        ELF: 0,
        ADA: 0.8,
        STORJ: 4.98,
        REQ: 9.05,
        VIRTUAL: 0.5,
        CHF: 0,
        RARE: 22,
        PAXG: 0.00038,
        REZ: 100,
        PAX: 0.017,
        BROCCOLI714: 0.67,
        GPS: 30,
        CHR: 13,
        VND: 0,
        CHZ: 1,
        ADX: 9.5,
        XRP: 0.2,
        JASMY: 84,
        TJS: 0,
        FIDA: 7.13,
        AED: 0,
        OCEAN: 4.45,
        ENA: 2,
        TKO: 0.1,
        ENJ: 0.0003,
        SOLV: 0.39,
        KZT: 0,
        YFII: 0.016,
        TOWNS: 49,
        BABY: 0.01,
        GRT: 14,
        AFN: 0,
        TFUEL: 3.2,
        ENS: 0.052,
        PDA: 70,
        KAIA: 0.005,
        TROY: 171,
        EURPS: 0,
        TLM: 277,
        CKB: 0.001,
        LUNC: 22.66,
        LUNA: 0.01,
        XTZ: 0.1,
        FORM: 0.69,
        BCHA: 0.00011,
        EOS: 0,
        RIF: 12,
        GTC: 3.73,
        PEN: 0,
        SOLO: 0,
        TMT: 0,
        HOME: 9.48,
        BURGER: 0,
        HOOK: 0.16,
        CLP: 0,
        XVG: 1,
        EPS: 0.034,
        TND: 0,
        EPX: 0,
        CLV: 62,
        STEEM: 0.01,
        MEME: 492,
        XVS: 0.0027,
        VRT: 0,
        GUN: 1,
        LAZIO: 0.016,
        KNCL: 2.38,
        CHESS: 0.24,
        TON: 0.02,
        INIT: 0.1,
        ERA: 0.02,
        DEGO: 1.04,
        PNUT: 2.97,
        MONKY: 50000,
        GYEN: 210,
        ERN: 0.46,
        VOXEL: 0.11,
        RLC: 1.28,
        PHA: 10,
        PHB: 0.03,
        MTLX: 0.72,
        BNBUP: 0,
        PHP: 0,
        SAHARA: 14,
        COP: 0,
        COS: 4.94,
        COW: 3.57,
        GLMR: 0.02,
        PROVE: 1.1,
        ETB: 0,
        SOPH: 1.4,
        ETC: 0.004,
        LAK: 0,
        ETH: 0.0001,
        NEO: 0,
        KLAY: 0.005,
        HIGH: 2.36,
        TRB: 0.036,
        ALT: 37,
        LBA: 10,
        ORDI: 1.2,
        WSOL: 0.002,
        TRU: 40,
        AMB: 1,
        WBNB: 0.00002,
        AMD: 0,
        NFP: 0.26,
        DREP: 6338,
        TRY: 0,
        TRX: 1,
        SIGN: 18,
        NFT: 258302,
        EUR: 0,
        ORCA: 0.29,
        AMP: 359,
        HIFI: 13,
        NULS: 0,
        USTC: 0.6,
        BERA: 0.001,
        RON: 0,
        NGN: 0,
        TST: 0.61,
        RDNTOLD: 0,
        CRC: 0,
        VANA: 0.001,
        PKR: 0,
        SPELL: 2624,
        EVX: 775,
        CRV: 1.48,
        BAKE: 0.21,
        RPL: 0.18,
        PLN: 0,
        LDO: 1,
        MAGIC: 0.93,
        ALICE: 3.39,
        BTTOLD: 26,
        BETA: 0,
        NIL: 0.1,
        TUT: 0.28,
        APE: 2.16,
        CTK: 0.05,
        MATIC: 0.079,
        APT: 0.016,
        PNT: 698,
        PYTH: 5.42,
        DENT: 1648,
        TWD: 0,
        ETHUP: 0,
        BAND: 0.01,
        POL: 0.027,
        ASTR: 2,
        RSR: 159,
        NKN: 46,
        TWT: 0.022,
        PARTI: 0.098,
        CVC: 14,
        ARB: 0.43,
        LOKA: 6.66,
        ARK: 0.3,
        CVP: 191,
        ARS: 0,
        '1000CAT': 2.14,
        CVX: 0.32,
        SUSHI: 1.67,
        WBTC: 0.000011,
        RUB: 0,
        BTTC: 4000,
        FIRO: 0.02,
        ASR: 0,
        AST: 0,
        MANA: 4.62,
        ATA: 0.36,
        NMR: 0.15,
        ATM: 0,
        JEX: 10.85,
        TNSR: 5.28,
        POLYX: 5,
        LOOM: 0,
        RVN: 0.1,
        TZS: 0,
        ONDO: 1.39,
        AUD: 0,
        KAVA: 0.03,
        PSG: 0,
        NOK: 0,
        AVA: 2.28,
        STRAX: 0.01,
        NOT: 54,
        CZK: 0,
        WAN: 0.005,
        EURI: 0.014,
        MASK: 1.02,
        AWE: 7.71,
        YFI: 0.00024,
        LQTY: 1.4,
        HEI: 3.05,
        PIXEL: 38,
        AXL: 0.02,
        YGG: 8.38,
        AXS: 0.56,
        SYRUP: 0,
        WCT: 0.14,
        COMP: 0.028,
        HAEDAL: 0.14,
        HFT: 15,
        RUNE: 0.1,
        PENGU: 20,
        BANANAS31: 2.44,
        FORTH: 0.48,
        GHST: 2.86,
        ALPINE: 0.0086,
        LEVER: 9020,
        IDEX: 51,
        BNBDOWN: 0,
        DEXE: 0.18,
        LISTA: 0.061,
        AVAX: 0.008,
        AZN: 0,
        UAH: 0,
        BANANA: 0.059,
        NEIRO: 3510,
        BTCUP: 0,
        HIVE: 0.01,
        KAITO: 0.36,
        LPT: 0.2,
        RDNT: 10,
        PYR: 1.24,
        DAI: 1.27,
        FET: 0.00001,
        DAR: 0.52,
        LRC: 14,
        ALPACA: 0.91,
        NVT: 0.1,
        DASH: 0.0002,
        SAGA: 0.1,
        JOD: 0,
        HKD: 0,
        JOE: 0.61,
        LSK: 3.37,
        DCR: 0.006,
        WIF: 0.75,
        DATA: 80,
        LTC: 0.0001,
        METIS: 0.0015,
        WIN: 106,
        SAR: 0,
        LTO: 5,
        DYDX: 0.01,
        AGIX: 4.45,
        POND: 141,
        JPY: 0,
        LINA: 231335,
        LINK: 0.051,
        QTUM: 0.05,
        CYBER: 0.58,
        UFT: 0,
        FIL: 0.001,
        ARBUSDCE: 0.21,
        STMX: 11108,
        FIO: 8,
        BAL: 0,
        FIS: 10,
        BAR: 0,
        BAT: 8.57,
        '1000CHEEMS': 13,
        NZD: 0,
        AKRO: 11323,
        COTI: 24,
    },
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const exchange = searchParams.get('exchange')
        const currency: string | null = searchParams.get('currency')

        if (!exchange) {
            return NextResponse.json({ error: 'Exchange parameter is required' }, { status: 400 })
        }

        let fees: Record<string, number> = {}

        // Handle exchanges with live API data
        if (exchange === 'btcmarkets') {
            fees = await getBTCMarketFee()
        } else if (exchange === 'independentreserve') {
            fees = await getIndependentReserveFee()
        } else if (exchange === 'okx') {
            fees = await getOKXFee()
        } else if (exchange === 'day1x') {
            fees = {
                override: 0,
            }
            // } else if (exchange === 'coinspot') {
            //     fees = await getCoinspotFee()
        } else if (exchange === 'luno') {
            if (!currency) {
                return NextResponse.json({ error: 'Currency parameter is required' }, { status: 400 })
            }
            fees = await getLunoFee({ currency })
        } else if (exchange === 'digitalsurge') {
            fees = await getDigitalSurgeFee()
        } else if (exchange === 'coinstash' && currency) {
            fees = getCoinstashFee(currency)
        } else if (exchange === 'swyftx' && currency) {
            fees = getSwyftxFee(currency)
            // } else if (exchange === 'wayex') {
            // fees = await getWayexFee()
        } else {
            // Get withdrawal fees for other exchanges, fallback to default if not found
            const exchangeFees = withdrawalFees[exchange as keyof typeof withdrawalFees] ?? {}
            fees = exchangeFees as Record<string, number>
        }

        return NextResponse.json(
            { fees, feeType: exchangeFeeType[exchange as keyof typeof exchangeFeeType] },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
                },
            }
        )
    } catch (error) {
        console.error('Error fetching withdrawal fees:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function getBTCMarketFee(): Promise<Record<string, number>> {
    try {
        const response = await fetch('https://api.btcmarkets.net/v3/withdrawal-fees', {
            next: { revalidate }, // Cache for 24 hours
        })

        if (!response.ok) {
            throw new Error(`BTCMarkets API error: ${response.status}`)
        }

        const data = await response.json()

        // Transform the array of objects into Record<string, number>
        const fees: Record<string, number> = {}

        data.forEach((item: { assetName: string; fee: string }) => {
            fees[item.assetName] = parseFloat(item.fee)
        })

        return fees
    } catch (error) {
        console.error('Error fetching BTCMarkets fees:', error)
        return {}
    }
}

async function getIndependentReserveFee(): Promise<Record<string, number>> {
    try {
        const response = await fetch('https://api.independentreserve.com/Public/GetCryptoWithdrawalFees2', {
            next: { revalidate }, // Cache for 24 hours
        })

        if (!response.ok) {
            throw new Error(`Independent Reserve API error: ${response.status}`)
        }

        const data = await response.json()

        // Transform the array of objects into Record<string, number>
        const fees: Record<string, number> = {}

        data.forEach((item: { Currency: string; Fee: number }) => {
            fees[normalizeCoinSymbol(item.Currency)] = item.Fee
        })

        return fees
    } catch (error) {
        console.error('Error fetching Independent Reserve fees:', error)
        return {}
    }
}

// https://api.independentreserve.com/Public/GetCryptoWithdrawalFees2
// [
//     {
//       "Fee": 0.00001,
//       "Network": "Bitcoin",
//       "Currency": "Xbt"
//     },
//     {
//       "Fee": 2,
//       "Network": "Tron",
//       "Currency": "Usdt"
//     },
//     {
//       "Fee": 5,
//       "Network": "Ethereum",
//       "Currency": "Usdt"
//     }
//   ]

function normalizeCoinSymbol(coin: string) {
    if (coin.toLowerCase() === 'xbt') {
        return 'BTC'
    }
    return coin.toUpperCase()
}

async function getOKXFee(): Promise<Record<string, number>> {
    const exchange = new okx({
        apiKey: process.env.OKX_KEY,
        secret: process.env.OKX_SECRET,
        password: process.env.OKX_PASSWORD,
        timeout: 10000,
    })
    await exchange.loadMarkets()

    const currencies = await exchange.fetchCurrencies()

    const fees: Record<string, number> = {}

    for (const coin of Object.keys(currencies)) {
        const currency = currencies[coin] as any
        if (currency?.networks) {
            const networks = currency.networks as Record<string, any>
            const network = networks[coin] || networks['ERC20'] || networks['SOL']
            if (network?.fee) {
                fees[coin] = network.fee
            }
        }
    }

    return fees
}

// use binance as proxy for coinspot
// async function getCoinspotFee(): Promise<Record<string, number>> {
//     const exchange = new binance({
//         apiKey: process.env.BINANCE_KEY,
//         secret: process.env.BINANCE_SECRET,
//     })
//     await exchange.loadProxyModules()
//     exchange.socksProxy = process.env.SOCKS_PROXY_URL!
//     await exchange.loadMarkets()
//     await exchange.fetchCurrencies()

//     const currencies = await exchange.fetchCurrencies()

//     const fees: Record<string, number> = {}

//     for (const [coin, info] of Object.entries(currencies)) {
//         fees[coin] = info.fee as number
//     }

//     return fees
// }

const dummyAddresses: Record<string, string> = {
    ETH: '0x0000000000000000000000000000000000000000',
    BTC: '3NqxbRaZyU9hv6wP7Wr5GPHyS5bhNZzFpw',
    XRP: 'r47bGjPxUWEdGmh9XhES4f2FUuDWEhxfbJ|||124',
    USDT: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
    SOL: '5aB7nyNJTuQZdKnhZXQHNhT16tBNevCuLRp14btvANxu',
    AVAX: '0x9206cf2AE2Be546392550aC6801Ac4a874B05C4c',
    default: '0x0000000000000000000000000000000000000000',
}

// The only exception to this is XRP, which has a fixed 0.03% send fee.
async function getLunoFee({ currency }: { currency: string }) {
    const amount = 1
    const address = dummyAddresses[currency] ?? dummyAddresses.default
    const exchange = new luno({
        apiKey: process.env.LUNO_KEY,
        secret: process.env.LUNO_SECRET,
    })
    await exchange.loadMarkets()
    const signed = exchange.sign('/api/1/send_fee', 'private', 'GET')
    const response = await fetch(
        `https://api.luno.com/api/1/send_fee?amount=${amount}&currency=${currency}&address=${address}`,
        { headers: signed.headers }
    )
    const data = await response.json()

    return { [currency]: Number(data.fee) }
}

async function getDigitalSurgeFee(): Promise<Record<string, number>> {
    const response = await fetch('https://digitalsurge.com.au/api/public/broker/assets/')
    const data = await response.json()

    const fees: Record<string, number> = {}
    for (const asset of data.results) {
        fees[asset.code] = Number(asset.withdrawal_fee)
    }

    return fees
}

function getCoinstashFee(currency: string): Record<string, number> {
    return { [currency]: coinstashWithdrawFees[currency as keyof typeof coinstashWithdrawFees] }
}

function getSwyftxFee(currency: string): Record<string, number> {
    const fee = swyftxWithdrawFees[currency as keyof typeof swyftxWithdrawFees]
    if (fee === undefined || fee === null) {
        return {}
    }
    return { [currency]: fee }
}

const exchangeFeeType = {
    btcmarkets: 'dynamic',
    independentreserve: 'dynamic',
    okx: 'dynamic',
    coinspot: 'dynamic',
    luno: 'dynamic',
    digitalsurge: 'dynamic',
    coinstash: 'static',
    swyftx: 'static',
    day1x: 'free',
    bitaroo: 'static',
    hardblock: 'static',
    // TODO: Update wayex fee type once API is integrated ('dynamic', 'static', or 'free')
    // wayex: 'dynamic',
}
