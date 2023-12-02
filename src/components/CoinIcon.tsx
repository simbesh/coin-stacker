import Image from 'next/image'
import AUD from 'cryptocurrency-icons/svg/color/usd.svg'
import BTC from 'cryptocurrency-icons/svg/color/btc.svg'
import ETH from 'cryptocurrency-icons/svg/color/eth.svg'
import LTC from 'cryptocurrency-icons/svg/color/ltc.svg'
import DOGE from 'cryptocurrency-icons/svg/color/doge.svg'
import ADA from '@/assets/icons/coins/ada.svg'
import SOL from 'cryptocurrency-icons/svg/color/sol.svg'
import XRP from 'cryptocurrency-icons/svg/color/xrp.svg'
import BNB from 'cryptocurrency-icons/svg/color/bnb.svg'
import assetsManifest from 'cryptocurrency-icons/manifest.json'
import generic from 'cryptocurrency-icons/svg/color/generic.svg'
import { cn } from '@/lib/utils'

const symbolMap: any = {
    AUD,
    BTC,
    ETH,
    XRP,
    LTC,
    SOL,
    DOGE,
    ADA,
    BNB,
}
const getCoin = (market: string) => {
    return market ? market.split('/')[0] : market
}
const Coin = ({ symbol, className }: string | any) => {
    if (symbol?.includes('/')) {
        symbol = getCoin(symbol)
    }
    const exists = assetsManifest.find((asset: any) => asset.symbol === symbol)
    return (
        <div className={cn('h-5 w-5', className)}>
            <div className={cn('h-5 w-5', className)}>
                {exists ? (
                    <Image
                        title={symbol}
                        src={require(`/node_modules/cryptocurrency-icons/svg/color/${symbol?.toLowerCase()}.svg`)}
                        height={24}
                        width={24}
                        alt={symbol}
                    />
                ) : (
                    <Image src={symbolMap[symbol] ?? generic} height={24} width={24} alt={symbol} />
                )}
            </div>
        </div>
    )
}

export default Coin
