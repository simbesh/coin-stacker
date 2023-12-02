import '@/styles/globals.css'

import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/theme-provider'
import NavBar from '@/components/NavBar'
import Script from 'next/script'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
})

export const metadata = {
    title: 'CoinStacker',
    description: 'Stack more Coins.',
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
            <Script async src="/api/beep" data-website-id={process.env.UMAMI_KEY} />
            <body className={`font-sans ${inter.variable}`}>
                <main
                    id="main"
                    className={
                        'min-h-[100svh] bg-gradient-to-b from-slate-50 to-slate-100 p-2 dark:from-slate-900 dark:to-slate-950'
                    }
                >
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                        <NavBar />
                        {children}
                        <footer
                            className={
                                'fixed bottom-0 flex w-full items-center justify-center gap-4 bg-slate-50 font-mono text-sm text-slate-300 dark:bg-slate-950 dark:text-slate-700 sm:text-base'
                            }
                        >
                            <div>{'v' + process.env.APP_VERSION}</div>
                            <div>{process.env.COMMIT_HASH}</div>
                            <Button variant={'ghost'} size={'icon-sm'}>
                                <a href={process.env.REPO_LINK}>
                                    <Github className={'icon-sm'} />
                                </a>
                            </Button>
                        </footer>
                    </ThemeProvider>
                    <Analytics />
                </main>
            </body>
        </html>
    )
}
