export const metadata = {
    title: 'Privacy – CoinStacker',
    description: 'Privacy information for CoinStacker',
}

export default function PrivacyPage() {
    return (
        <div className="z-20 mx-auto max-w-2xl px-4 py-12 text-slate-700 dark:text-slate-300">
            <h1 className="mb-6 font-bold text-3xl text-slate-900 dark:text-slate-100">Privacy</h1>

            <section className="space-y-4 text-sm leading-relaxed">
                <p>
                    CoinStacker collects anonymous analytics to understand how the platform is used and to improve the
                    experience for everyone. This data does not identify you personally.
                </p>

                <h2 className="pt-2 font-semibold text-lg text-slate-800 dark:text-slate-200">What we collect</h2>
                <ul className="list-inside list-disc space-y-1">
                    <li>Page views and navigation patterns</li>
                    <li>General device and browser information</li>
                    <li>Aggregated usage statistics</li>
                </ul>

                <h2 className="pt-2 font-semibold text-lg text-slate-800 dark:text-slate-200">
                    What we don&apos;t collect
                </h2>
                <ul className="list-inside list-disc space-y-1">
                    <li>Personal information or account details</li>
                    <li>IP addresses (anonymised before storage)</li>
                    <li>Financial or wallet data</li>
                </ul>

                <h2 className="pt-2 font-semibold text-lg text-slate-800 dark:text-slate-200">Third-party services</h2>
                <p>
                    We use{' '}
                    <a
                        className="underline hover:text-slate-900 dark:hover:text-slate-100"
                        href="https://posthog.com"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        PostHog
                    </a>{' '}
                    and{' '}
                    <a
                        className="underline hover:text-slate-900 dark:hover:text-slate-100"
                        href="https://vercel.com/analytics"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Vercel Analytics
                    </a>{' '}
                    to collect anonymous usage data. Both services are configured to respect user privacy.
                </p>

                <p className="pt-4 text-slate-500 text-xs">
                    If you have questions, feel free to reach out via the project&apos;s GitHub repository.
                </p>
            </section>
        </div>
    )
}
