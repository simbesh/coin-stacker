import '@/styles/globals.css'

import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/theme-provider'
import NavBar from '@/components/NavBar'
import { Button } from '@/components/ui/button'
import { PHProvider, PostHogPageview } from '@/app/providers'
import { Suspense } from 'react'
import { RiGithubLine } from 'react-icons/ri'

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
            <body className={`font-sans ${inter.variable}`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                    <NavBar />
                    <Suspense>
                        <PostHogPageview />
                    </Suspense>
                    <PHProvider>
                        <main
                            id="main"
                            className={
                                'min-h-[100svh] bg-gradient-to-b from-slate-50 to-slate-100 p-2 dark:from-slate-900 dark:to-slate-950'
                            }
                        >
                            {children}
                        </main>
                    </PHProvider>
                    <footer
                        className={
                            'fixed bottom-0 flex w-full items-center justify-center gap-4 bg-slate-50 font-mono text-xs text-slate-300 sm:text-base dark:bg-slate-950 dark:text-slate-700'
                        }
                    >
                        <div>{'v' + process.env.APP_VERSION}</div>
                        <div>{process.env.COMMIT_HASH}</div>
                        <Button variant={'ghost'} size={'size-4'} aria-label="Open Github Repo">
                            <a href={process.env.REPO_LINK} target={'_blank'}>
                                <RiGithubLine className={'size-4'} />
                            </a>
                        </Button>
                    </footer>
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    )
}
