'use client'

import { useMediaQuery } from '@uidotdev/usehooks'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export default function GradientText() {
    const refText = useRef<HTMLHeadingElement>(null)
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    useEffect(() => {
        if (!isSmallDevice) {
            document.onmousemove = moveMouse

            function moveMouse(evt: MouseEvent) {
                if (refText.current) {
                    const rect = refText.current.getBoundingClientRect()
                    const x = evt.clientX - rect.left
                    const y = evt.clientY - rect.top

                    refText.current.style.backgroundPosition = `${x}px ${y}px`
                }
            }

            return () => {
                document.onmousemove = null
            }
        }
    }, [isSmallDevice])

    return (
        <h2
            className={cn(
                'mt-2 flex w-full max-w-full flex-wrap items-end justify-center gap-1 px-2 font-bold text-2xl text-slate-900 sm:text-3xl dark:text-slate-200',
                !isSmallDevice && 'gradient-text',
            )}
            ref={refText}
            style={isSmallDevice ? undefined : { backgroundSize: '100vw 100%' }}
        >
            {isSmallDevice ? (
                <>
                    <div className={'whitespace-nowrap'}>Find the best price...</div>
                    <div className="bg-linear-to-l from-primary to-slate-900 bg-clip-text text-transparent dark:to-slate-200">
                        Stack more coins!
                    </div>
                </>
            ) : (
                <>
                    <div className={'whitespace-nowrap'}>Find the best price...</div>
                    <div className={'whitespace-nowrap'}>Stack more coins!</div>
                </>
            )}
        </h2>
    )
}
