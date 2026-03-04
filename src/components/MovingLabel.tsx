import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from 'motion/react'
import type React from 'react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

export function MovingLabel({
    borderRadius = '1.75rem',
    children,
    as: Component = 'button',
    containerClassName,
    borderClassName,
    duration,
    className,
    ...otherProps
}: {
    borderRadius?: string
    children: React.ReactNode
    as?: React.ElementType // Updated type here
    containerClassName?: string
    borderClassName?: string
    duration?: number
    className?: string
    [key: string]: unknown
}) {
    return (
        <Component
            className={cn('relative h-9 overflow-hidden bg-transparent p-[1px] text-xl', containerClassName)}
            style={{
                borderRadius,
            }}
            {...otherProps}
        >
            <div className="absolute inset-0" style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}>
                <MovingBorder duration={duration} rx="30%" ry="30%">
                    <div
                        className={cn(
                            'h-12 w-20 bg-[radial-gradient(#febc16_15%,transparent_60%)] opacity-[0.6]',
                            borderClassName,
                        )}
                    />
                </MovingBorder>
            </div>

            <div
                className={cn(
                    'relative flex h-full w-full items-center justify-center border border-slate-800 bg-slate-900/[0.5] text-sm text-white antialiased backdrop-blur-xl',
                    className,
                )}
                style={{
                    borderRadius: `calc(${borderRadius} * 1)`,
                }}
            >
                {children}
            </div>
        </Component>
    )
}

export const MovingBorder = ({
    children,
    duration = 2000,
    rx,
    ry,
    ...otherProps
}: {
    children: React.ReactNode
    duration?: number
    rx?: string
    ry?: string
    [key: string]: unknown
}) => {
    const pathRef = useRef<SVGRectElement | null>(null)
    const progress = useMotionValue<number>(0)

    useAnimationFrame((time) => {
        const length = pathRef.current?.getTotalLength()
        if (length) {
            const pxPerMillisecond = length / duration
            progress.set((time * pxPerMillisecond) % length)
        }
    })

    const x = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).x)
    const y = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).y)

    const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`

    return (
        <>
            <svg
                className="absolute h-full w-full"
                height="100%"
                preserveAspectRatio="none"
                width="100%"
                {...otherProps}
            >
                <rect fill="none" height="100%" ref={pathRef} rx={rx} ry={ry} width="100%" />
            </svg>
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: 'inline-block',
                    transform,
                }}
            >
                {children}
            </motion.div>
        </>
    )
}
