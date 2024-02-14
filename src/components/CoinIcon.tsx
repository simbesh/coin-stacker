import Image from 'next/image'
import AUD from 'cryptocurrency-icons/svg/color/usd.svg'
import ADA from '@/assets/icons/coins/ada.svg'
import SOL from '@/assets/icons/coins/sol.svg'
import assetsManifest from 'cryptocurrency-icons/manifest.json'
import generic from 'cryptocurrency-icons/svg/color/generic.svg'
import { cn } from '@/lib/utils'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'

interface Asset {
    symbol: string
    name: string
    color: string
}

const symbolOverride: Record<string, StaticImport> = {
    AUD,
    SOL,
    ADA,
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
                    <Image src={symbolOverride[currency] as StaticImport} height={24} width={24} alt={currency} />
                ) : exists ? (
                    <Image
                        title={currency}
                        src={require(`/node_modules/cryptocurrency-icons/svg/color/${currency.toLowerCase()}.svg`)}
                        height={24}
                        width={24}
                        alt={currency}
                    />
                ) : (
                    <Image src={generic} height={24} width={24} alt={currency} />
                )}
            </div>
        </div>
    )
}

export default Coin
