'use client'

import { useLocalStorage } from '@uidotdev/usehooks'
import { addMonths, isAfter } from 'date-fns'
import { X } from 'lucide-react'
import Image from 'next/image'
import { Vibrant } from 'node-vibrant/browser'
import { useEffect, useMemo, useState } from 'react'
import { TextShimmer } from './ui/text-shimmer'

const DISMISSED_BANNERS_KEY = 'new-exchange-announment-banner-dismissed'

interface AlertBannerProps {
    anchorDate: string
    dismissKey: string
    iconSrc: string
    message: string
    title: string
}

interface RGB {
    b: number
    g: number
    r: number
}

function rgbToCss({ r, g, b }: RGB) {
    return `rgb(${r}, ${g}, ${b})`
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

function adjustColor(color: RGB, amount: number): RGB {
    return {
        r: clamp(color.r + amount, 0, 255),
        g: clamp(color.g + amount, 0, 255),
        b: clamp(color.b + amount, 0, 255),
    }
}

const HTTP_PROTOCOLS = new Set(['http:', 'https:'])

function getSampleableImageSrc(src: string): string {
    try {
        const url = new URL(src)

        if (HTTP_PROTOCOLS.has(url.protocol)) {
            return `/api/image-proxy?src=${encodeURIComponent(src)}`
        }
    } catch {
        return src
    }

    return src
}

async function getDominantColorFromImage(src: string): Promise<RGB> {
    const palette = await Vibrant.from(src).getPalette()

    let bestSwatch = palette.Vibrant ?? palette.DarkVibrant ?? palette.Muted ?? palette.DarkMuted

    for (const swatch of Object.values(palette)) {
        if (!swatch) {
            continue
        }

        if (!bestSwatch || swatch.population > bestSwatch.population) {
            bestSwatch = swatch
        }
    }

    if (!bestSwatch) {
        throw new Error('No palette swatches found')
    }

    const [r, g, b] = bestSwatch.rgb

    return { r, g, b }
}

export function NewExchangeBanner({ anchorDate, dismissKey, iconSrc, title, message }: AlertBannerProps) {
    const [dismissedExchanges, setDismissedExchanges] = useLocalStorage<string[]>(DISMISSED_BANNERS_KEY, [])
    const sampledIconSrc = useMemo(() => getSampleableImageSrc(iconSrc), [iconSrc])
    const [dominantColor, setDominantColor] = useState<RGB | null>(null)
    const isExpired = useMemo(() => {
        const parsedAnchorDate = new Date(anchorDate)

        if (Number.isNaN(parsedAnchorDate.getTime())) {
            return false
        }

        return isAfter(new Date(), addMonths(parsedAnchorDate, 1))
    }, [anchorDate])
    const isDismissed = dismissedExchanges.includes(dismissKey)

    useEffect(() => {
        let cancelled = false

        setDominantColor(null)

        getDominantColorFromImage(sampledIconSrc)
            .then((color) => {
                if (!cancelled) {
                    setDominantColor(color)
                }
            })
            .catch(() => undefined)

        return () => {
            cancelled = true
        }
    }, [sampledIconSrc])

    const gradientStyle = useMemo(() => {
        if (!dominantColor) {
            return undefined
        }

        const start = adjustColor(dominantColor, 30)
        const end = adjustColor(dominantColor, -20)

        return {
            background: `linear-gradient(135deg, ${rgbToCss(start)} 0%, ${rgbToCss(
                dominantColor,
            )} 45%, ${rgbToCss(end)} 100%)`,
        }
    }, [dominantColor])

    if (isDismissed || isExpired) {
        return null
    }

    return (
        <div className="relative m-2 w-full overflow-hidden rounded-2xl border border-white/20 bg-transparent p-3 pr-10 text-white shadow-lg sm:max-w-lg">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    ...gradientStyle,
                    opacity: gradientStyle ? 1 : 0,
                }}
            />
            <button
                aria-label={`Dismiss ${title} announcement`}
                className="absolute top-2 right-2 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-black/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                onClick={() => {
                    if (dismissedExchanges.includes(dismissKey)) {
                        return
                    }

                    setDismissedExchanges([...dismissedExchanges, dismissKey])
                }}
                type="button"
            >
                <X className="pointer-events-none size-5" />
            </button>
            <div className="relative z-10 flex items-start gap-3">
                <Image
                    alt=""
                    className="h-10 w-10 rounded-md bg-white/10 p-1"
                    height={40}
                    src={sampledIconSrc}
                    unoptimized
                    width={40}
                />

                <div className="min-w-0">
                    <h2 className="font-semibold text-lg">
                        {title}
                        <span className="ml-2 rounded-sm bg-white/60 p-0.5 px-1 text-sm dark:bg-black/40">
                            <TextShimmer className="[--base-color:#d97706] dark:[--base-color:#f59e0b]" duration={1}>
                                NEW
                            </TextShimmer>
                        </span>
                    </h2>
                    <p className="mt-1 text-sm text-white">{message}</p>
                </div>
            </div>
        </div>
    )
}
