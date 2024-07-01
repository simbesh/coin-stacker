import ExchangeIcon from '@/components/ExchangeIcon'

export function CoinSpotInfoAlert() {
    return (
        <div className="w-full max-w-2xl rounded-md border border-blue-500 bg-blue-500/10 p-2 px-4">
            <div>
                <span className="flex flex-wrap items-center gap-1 text-xs text-blue-300 sm:text-sm">
                    <span className="mr-1 font-bold text-blue-300">Note: </span>
                    <ExchangeIcon exchange={'coinspot'} withLabel /> doesn't have a low-fee{' '}
                    <span className="font-bold text-blue-300">SOL/AUD</span>
                    market!
                </span>
            </div>
            <span className="flex flex-col text-xs text-blue-100 sm:flex-row sm:text-sm">
                <span>Let them know if you want to see this market added:</span>
                <div className="flex gap-2 sm:ml-2">
                    <a href={'https://x.com/coinspotau'} target={'_blank'} className={'underline'}>
                        Twitter/X
                    </a>
                    <a href={'https://www.facebook.com/coinspotau'} target={'_blank'} className={'underline'}>
                        Facebook
                    </a>
                    <a href={'https://www.coinspot.com.au/contact'} target={'_blank'} className={'underline'}>
                        Support
                    </a>
                    <a href={'mailto:support@coinspot.com.au'} target={'_blank'} className={'underline'}>
                        Email
                    </a>
                </div>
            </span>
        </div>
    )
}
