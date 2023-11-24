import PriceLookup from '@/components/PriceLookup'
import ClientOnly from '@/components/ClientOnly'

export default function HomePage() {
    return (
        <main className="flex min-h-[100svh] flex-col items-center justify-start bg-gradient-to-b from-slate-50 to-slate-100 p-2 dark:from-slate-900 dark:to-slate-950 sm:p-4">
            <div className={'mt-5 select-none sm:mt-12'}>
                <h3 className="text-center text-5xl font-bold">
                    <span className={'text-2xl'}>🇦🇺 </span>Crypto Price Aggregator
                </h3>
                <h2 className="mt-2 flex flex-wrap justify-center text-2xl font-semibold text-slate-500">
                    <div className={'whitespace-nowrap'}>Find the best price...</div>
                    <div className={'whitespace-nowrap text-right'}>
                        <span className={'text-yellow-400'}> Stack</span> more{' '}
                        <span className={'text-yellow-400'}>coins</span>.
                    </div>
                </h2>
            </div>
            <ClientOnly>
                <PriceLookup />
            </ClientOnly>
        </main>
    )
}
