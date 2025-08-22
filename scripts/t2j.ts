import { tabletojson } from 'tabletojson'

tabletojson.convertUrl(
    'https://swyftx.com/network-withdrawal-fees/',
    { stripHtmlFromCells: false },
    function (tablesAsJson) {
        let parsed = tablesAsJson[0].map((row: any) => {
            return {
                currency: row['Coin/Token'].match(regex)?.[1],
                network: parseNetworkFees(row['Network'], row['Withdrawal fee']),
            }
        })
        const fs = require('fs')
        fs.writeFileSync('swyftx-fees.json', JSON.stringify(parsed, null, 2))

        console.log(parsed[0])
    }
)

//
const regex = /<span class="text-xs">([A-Z]+)<\/span>/

function parseNetworkFees(network: string, fee: string) {
    const networks = network.split('<br>')
    const fees = fee.split('<br>')
    const result: Record<string, string> = {}

    networks.forEach((net, i) => {
        if (net && fees[i]) {
            result[net.trim()] = fees[i].trim()
        }
    })

    return result
}
