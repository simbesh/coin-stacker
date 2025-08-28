'use client'
import { motion } from 'motion/react'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

const options = [
    {
        key: 'buy',
        label: 'Buy',
        bgColor: 'bg-emerald-400 dark:bg-emerald-800',
    },
    {
        key: 'sell',
        label: 'Sell',
        bgColor: 'bg-red-400 dark:bg-red-800',
    },
] as const

const TextSwitch = ({
    side,
    setSide,
    ...props
}: { side: 'buy' | 'sell'; setSide: (side: 'buy' | 'sell') => void } & React.ComponentPropsWithoutRef<'div'>) => {
    const handleSideClick = useCallback(
        (sideKey: 'buy' | 'sell') => {
            setSide(sideKey)
        },
        [setSide]
    )

    return (
        <div className="border-border relative mx-8 flex h-12 items-center rounded-md border p-1 shadow" {...props}>
            {options.map(({ key, label, bgColor }) => {
                const isActive = side === key
                return (
                    <button
                        key={key}
                        className={cn(
                            'relative flex h-10 w-1/2 items-center justify-center rounded-sm font-bold capitalize',
                            isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        )}
                        onClick={() => handleSideClick(key)}
                        type="button"
                        aria-label={`Select ${label} Side`}
                    >
                        {isActive && (
                            <motion.div
                                className={cn('absolute inset-0 rounded-sm shadow', bgColor)}
                                layoutId="activeTextSwitchBackground"
                                transition={{ type: 'spring', duration: 0.5 }}
                            />
                        )}
                        <span className="relative z-10">{label}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default TextSwitch
