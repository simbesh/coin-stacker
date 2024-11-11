import PriceLookup from '@/components/PriceLookup'
import ClientOnly from '@/components/ClientOnly'
import GradientText from '@/components/GradientText'

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-start px-0 sm:px-4">
            <div className={'mt-5 select-none sm:mt-12'}>
                <h3 className="text-center text-3xl font-bold sm:text-5xl">
                    <div className={'flex flex-wrap items-center justify-center'}>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <img src="au-flag-32.png" className="size-8" />
                            <span>Crypto Price</span>
                        </div>
                        <span className="ml-2">Aggregator</span>
                    </div>
                </h3>
                <GradientText />
            </div>
            <ClientOnly>
                <PriceLookup />
            </ClientOnly>
        </div>
    )
}
