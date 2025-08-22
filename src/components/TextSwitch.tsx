import { cn } from '@/lib/utils'

const Button = ({
    side,
    setSide,
    selectedSide,
}: {
    side: 'buy' | 'sell'
    setSide: (side: 'buy' | 'sell') => void
    selectedSide: 'buy' | 'sell'
}) => {
    return (
        <button
            className={cn(
                'z-10 w-full rounded-l-md py-1 font-bold focus:border-0 focus:ring-0 ',
                selectedSide === side
                    ? 'text-black dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            )}
            type="button"
            onClick={() => setSide(side)}
            aria-label={`Select ${side} Side`}
        >
            <span className="capitalize">{side}</span>
        </button>
    )
}

const TextSwitch = ({
    side,
    setSide,
}: { side: 'buy' | 'sell'; setSide: (side: 'buy' | 'sell') => void } & React.ComponentPropsWithoutRef<'div'>) => {
    return (
        <div className="border-border relative mx-8 flex h-12 items-center rounded-md border p-1 shadow">
            <div className="flex w-full justify-center">
                <Button side="buy" setSide={setSide} selectedSide={side} />
            </div>
            <div className="flex w-full justify-center">
                <Button side="sell" setSide={setSide} selectedSide={side} />
            </div>
            <span
                className={cn(
                    side === 'buy'
                        ? 'left-1 bg-emerald-400 dark:bg-emerald-800'
                        : 'translate-x-[calc(100%-0.5rem)] bg-red-400 dark:bg-red-800',
                    'absolute flex h-10 w-1/2 items-center justify-center rounded-sm font-bold capitalize text-white shadow transition-all'
                )}
            ></span>
        </div>
    )
}

export default TextSwitch
