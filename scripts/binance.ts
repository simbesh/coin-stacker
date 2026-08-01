import { binance } from 'ccxt'

async function tst() {
    const exchange = new binance({
        apiKey: process.env.BINANCE_KEY,
        secret: process.env.BINANCE_SECRET,
    })
    await exchange.loadMarkets()
    await exchange.fetchCurrencies()

    const fees: Record<string, number> = Object.entries(exchange.currencies)
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce(
            (acc, [currency, data]) => {
                acc[currency] = data.fee ?? 0
                return acc
            },
            {} as Record<string, number>,
        )
    console.log(fees)

    // Save fees to JSON file
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    const outputPath = path.join(process.cwd(), 'data\\coinspot-fees.json')
    console.log(outputPath)
    const fileContent = JSON.stringify(fees, null, 4)
    await fs.writeFile(outputPath, fileContent, 'utf-8')
    console.log(`Fees saved to ${outputPath}`)
}

tst()
