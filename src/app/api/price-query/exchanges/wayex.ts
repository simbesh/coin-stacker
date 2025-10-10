import { ExchangeHandler, MarketNotFoundError, OrderBook } from '../types'

const parseWayexOrderBook = (data: any): OrderBook => {
    const bids: [number, number][] = []
    const asks: [number, number][] = []

    if (!Array.isArray(data) || data.length === 0) {
        // Return empty orderbook if data is invalid
        const timestamp = Date.now()
        return {
            bids: [],
            asks: [],
            timestamp,
            datetime: new Date(timestamp).toISOString(),
            nonce: timestamp,
        }
    }

    // Parse the array response
    // Format: [MDUpdateId, NumAccounts, ActionDateTime, ActionType, LastTradePrice,
    //          NumOrders, Price, ProductPairCode, Quantity, Side]
    for (let i = 0; i < data.length; i++) {
        const level = data[i]
        if (Array.isArray(level)) {
            const [, , , actionType, , , price, , quantity, side] = level

            if (actionType !== 2) {
                // Skip if action is Delete
                if (side === 0) {
                    bids.push([price, quantity])
                } else {
                    asks.push([price, quantity])
                }
            }
        }
    }

    const timestamp = Date.now()
    return {
        bids,
        asks,
        timestamp,
        datetime: new Date(timestamp).toISOString(),
        nonce: timestamp,
    }
}

export const getWayexOrderBook: ExchangeHandler = async (base: string, quote: string) => {
    const symbol = `${base}${quote}`

    // First, fetch instruments to get InstrumentId
    const instrumentsRes = await fetch('https://cexapi.wayex.com/ap/GetInstruments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            OMSId: 1,
        }),
    })

    if (!instrumentsRes.ok) {
        throw new Error(`Wayex GetInstruments API error: ${instrumentsRes.status}`)
    }

    const instruments = await instrumentsRes.json()
    const instrument = instruments.find((inst: any) => inst.Symbol === symbol)

    if (!instrument) {
        throw new MarketNotFoundError(`${base}/${quote}`, 'wayex')
    }

    // Now fetch the order book using the InstrumentId
    const orderbookRes = await fetch('https://cexapi.wayex.com/ap/GetL2Snapshot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            OMSId: 1,
            InstrumentId: instrument.InstrumentId,
            Depth: 100,
        }),
    })

    if (!orderbookRes.ok) {
        throw new Error(`Wayex GetL2Snapshot API error: ${orderbookRes.status}`)
    }

    const orderbookData = await orderbookRes.json()
    return parseWayexOrderBook(orderbookData)
}
