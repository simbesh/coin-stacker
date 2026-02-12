export const metadata = {
    title: 'Privacy – CoinStacker',
    description: 'Privacy information for CoinStacker',
}

export default function PrivacyPage() {
    return (
        <div className="z-20 mx-auto max-w-2xl px-4 py-12 text-slate-700 dark:text-slate-300">
            <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">Privacy</h1>

            <section className="space-y-4 text-sm leading-relaxed">
                <p>
                    CoinStacker collects anonymous analytics to understand how the platform is used and to improve the
                    experience for everyone. This data does not identify you personally.
                </p>

                <h2 className="pt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">What we collect</h2>
                <ul className="list-inside list-disc space-y-1">
                    <li>Page views and navigation patterns</li>
                    <li>General device and browser information</li>
                    <li>Aggregated usage statistics</li>
                </ul>

                <h2 className="pt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">What we don&apos;t collect</h2>
                <ul className="list-inside list-disc space-y-1">
                    <li>Personal information or account details</li>
                    <li>IP addresses (anonymised before storage)</li>
                    <li>Financial or wallet data</li>
                </ul>

                <h2 className="pt-2 text-lg font-semibold text-slate-800 dark:text-slate-200">Third-party services</h2>
                <p>
                    We use <a href="https://posthog.com" className="underline hover:text-slate-900 dark:hover:text-slate-100" target="_blank" rel="noopener noreferrer">PostHog</a> and{' '}
                    <a href="https://vercel.com/analytics" className="underline hover:text-slate-900 dark:hover:text-slate-100" target="_blank" rel="noopener noreferrer">Vercel Analytics</a>{' '}
                    to collect anonymous usage data. Both services are configured to respect user privacy.
                </p>

                <p className="pt-4 text-xs text-slate-500">
                    If you have questions, feel free to reach out via the project&apos;s GitHub repository.
                </p>
            </section>
        </div>
    )
}
