import '@/styles/globals.css'

import { PHProvider, PostHogPageview } from '@/app/providers'
import NavBar from '@/components/NavBar'
import { ThemeProvider } from '@/components/theme-provider'
import FlickeringGrid from '@/components/ui/flickering-grid'
import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'
import { TouchProvider } from '@/components/ui/hybrid-tooltip'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
})

export const metadata = {
    title: 'CoinStacker',
    description: 'Australian Crypto Price Aggregator',
    openGraph: {
        url: 'https://coinstacker.com.au',
        type: 'website',
        title: 'CoinStacker',
        description: 'Australian Crypto Price Aggregator',
        images: [
            {
                url: 'https://opengraph.b-cdn.net/production/images/178c6278-ea1b-44d7-8fa7-e249c959486c.png?token=Auv-p_COy0vtMIaoFA74gBohN7st9GRM5jl0tJzaktY&height=630&width=1200&expires=33291583602',
                width: 1200,
                height: 630,
                alt: 'CoinStacker',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        domain: 'coinstacker.com.au',
        url: 'https://coinstacker.com.au',
        title: 'CoinStacker',
        description: 'Australian Crypto Price Aggregator',
        images: [
            'https://opengraph.b-cdn.net/production/images/178c6278-ea1b-44d7-8fa7-e249c959486c.png?token=Auv-p_COy0vtMIaoFA74gBohN7st9GRM5jl0tJzaktY&height=630&width=1200&expires=33291583602',
        ],
    },
    icons: {
        icon: [
            {
                // media: "(prefers-color-scheme: light)",
                url: '/coinstacker-favicon-16.png',
                href: '/coinstacker-favicon-16.png',
            },
            // {
            //     media: "(prefers-color-scheme: dark)",
            //     url: "/favicon-dark.png",
            //     href: "/favicon-dark.png"
            // }
        ],
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`font-sans ${inter.variable}`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                    <TooltipProvider>
                        <TouchProvider>
                            <NavBar />
                            <Suspense>
                                <PostHogPageview />
                            </Suspense>
                            <PHProvider>
                                <NuqsAdapter>
                                    <main
                                        id="main"
                                        className={
                                            'min-h-dvh bg-linear-to-b from-slate-50 to-slate-100 p-2 dark:from-slate-900 dark:to-slate-950'
                                        }
                                    >
                                        {children}
                                    </main>
                                </NuqsAdapter>
                            </PHProvider>
                        </TouchProvider>
                    </TooltipProvider>
                </ThemeProvider>
                <Analytics />

                <FlickeringGrid
                    className="fixed inset-0 z-0 h-screen w-screen opacity-50"
                    squareSize={2}
                    gridGap={10}
                    color="#fdc535"
                    maxOpacity={0.6}
                    flickerChance={0.5}
                />
            </body>
        </html>
    )
}
