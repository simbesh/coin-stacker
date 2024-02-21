import PriceLookup from '@/components/PriceLookup'
import ClientOnly from '@/components/ClientOnly'
import GradientText from '@/components/GradientText'

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-start px-0 sm:px-4">
            <div className={'mt-5 select-none sm:mt-12'}>
                <h3 className="text-center text-5xl font-bold">
                    <span className={'text-3xl'}>🇦🇺 </span>Crypto Price Aggregator
                </h3>
                <GradientText />
            </div>
            <ClientOnly>
                <PriceLookup />
            </ClientOnly>
        </div>
    )
}
