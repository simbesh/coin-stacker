'use client'

import { useMediaQuery } from '@uidotdev/usehooks'
import { useEffect, useRef } from 'react'

export default function GradientText() {
    const refText = useRef<HTMLHeadingElement>(null)
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
    useEffect(() => {
        if (!isSmallDevice) {
            function getMousePos(evt: MouseEvent) {
                return {
                    x: evt.pageX,
                    y: evt.pageY,
                }
            }

            document.onmousemove = moveMouse

            function moveMouse(evt: MouseEvent) {
                const pos = getMousePos(evt)
                if (refText.current) {
                    refText.current.style.backgroundPosition = pos.x + 'px ' + pos.y + 'px'
                }
            }
        }
    }, [])

    return (
        <h2
            className="gradient-text mt-2 flex w-screen flex-wrap items-end justify-center gap-1 text-3xl font-bold text-slate-600 dark:text-slate-200"
            ref={refText}
        >
            {isSmallDevice ? (
                <>
                    <div className={'whitespace-nowrap'}>Find the best price...</div>
                    <div className="from-primary bg-gradient-to-l to-slate-600 bg-clip-text text-transparent dark:to-slate-200">
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
