import PriceLookup from '@/components/PriceLookup'
import ClientOnly from '@/components/ClientOnly'

export default function HomePage() {
    return (
        <main className="flex flex-col items-center justify-start px-0 sm:px-4">
            <div className={'mt-5 select-none sm:mt-12'}>
                <h3 className="text-center text-5xl font-bold">
                    <span className={'text-2xl'}>🇦🇺 </span>Crypto Price Aggregator
                </h3>
                <h2 className="mt-2 flex flex-wrap items-end justify-center gap-1 text-2xl font-bold text-slate-400 dark:text-slate-500">
                    <div className={'whitespace-nowrap'}>Find the best price... </div>
                    <div className={'text-primary whitespace-nowrap text-right'}>Stack more coins!</div>
                </h2>
            </div>
            <ClientOnly>
                <PriceLookup />
            </ClientOnly>
        </main>
    )
}
