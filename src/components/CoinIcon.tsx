import assetsManifest from 'cryptocurrency-icons/manifest.json'
import generic from 'cryptocurrency-icons/svg/color/generic.svg'
import AUD from 'cryptocurrency-icons/svg/color/usd.svg'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import ADA from '@/assets/icons/coins/ada.svg'
import HYPE from '@/assets/icons/coins/hype.png'
import SOL from '@/assets/icons/coins/sol.svg'
import SUI from '@/assets/icons/coins/sui.png'
import TRUMP from '@/assets/icons/coins/trump.png'
import { cn } from '@/lib/utils'

interface Asset {
    color: string
    name: string
    symbol: string
}

const symbolOverride: Record<string, StaticImport> = {
    AUD,
    SOL,
    ADA,
    TRUMP,
    SUI,
    HYPE,
}
const getCoin = (market: string) => {
    return (market.includes('/') ? market.split('/')[0] : market) ?? ''
}
const Coin = ({ symbol, className }: { symbol: string; className?: string }) => {
    const currency = getCoin(symbol)
    const exists = assetsManifest.find((asset: Asset) => asset.symbol === currency)
    return (
        <div className={cn('size-5', className)}>
            <div className={cn('size-5', className)}>
                {currency in symbolOverride ? (
                    <Image alt={currency} height={24} src={symbolOverride[currency] as StaticImport} width={24} />
                ) : exists ? (
                    <Image
                        alt={currency}
                        height={24}
                        src={require(`cryptocurrency-icons/svg/color/${currency.toLowerCase()}.svg`)}
                        title={currency}
                        width={24}
                    />
                ) : (
                    <Image alt={currency} height={24} src={generic} width={24} />
                )}
            </div>
        </div>
    )
}

export default Coin
