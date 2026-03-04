import ExchangeIcon from '@/components/ExchangeIcon'

export function CoinSpotInfoAlert() {
    return (
        <div className="w-full max-w-2xl rounded-md border border-blue-500 bg-blue-500/10 p-2 px-4">
            <div>
                <span className="flex flex-wrap items-center gap-1 text-blue-300 text-xs sm:text-sm">
                    <span className="mr-1 font-bold text-blue-300">Note: </span>
                    <ExchangeIcon exchange={'coinspot'} withLabel /> {"doesn't have a low-fee"}
                    <span className="font-bold text-blue-300">SOL/AUD</span>
                    market!
                </span>
            </div>
            <span className="flex flex-col text-blue-100 text-xs sm:flex-row sm:text-sm">
                <span>Let them know if you want to see this market added:</span>
                <div className="flex gap-2 sm:ml-2">
                    <a className={'underline'} href={'https://x.com/coinspotau'} rel="noopener" target={'_blank'}>
                        Twitter/X
                    </a>
                    <a
                        className={'underline'}
                        href={'https://www.facebook.com/coinspotau'}
                        rel="noopener"
                        target={'_blank'}
                    >
                        Facebook
                    </a>
                    <a
                        className={'underline'}
                        href={'https://www.coinspot.com.au/contact'}
                        rel="noopener"
                        target={'_blank'}
                    >
                        Support
                    </a>
                    <a className={'underline'} href={'mailto:support@coinspot.com.au'} rel="noopener" target={'_blank'}>
                        Email
                    </a>
                </div>
            </span>
        </div>
    )
}
