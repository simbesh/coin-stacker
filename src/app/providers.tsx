'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { type JSX, type ReactNode, useEffect } from 'react'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    })
}

export function PostHogPageview(): JSX.Element | null {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname
            if (searchParams.toString()) {
                url += `?${searchParams.toString()}`
            }
            posthog.capture('$pageview', {
                $current_url: url,
            })
        }
    }, [pathname, searchParams])

    return null
}

export function PHProvider({ children }: { children: ReactNode }) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
