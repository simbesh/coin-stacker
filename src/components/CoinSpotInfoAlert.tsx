import ExchangeIcon from '@/components/ExchangeIcon'

export function CoinSpotInfoAlert() {
    return (
        <div className="w-full max-w-2xl border border-blue-500 rounded-md p-2 px-4 bg-blue-500/10">
            <div>
                <span className="sm:text-sm text-xs text-blue-300 flex gap-1 items-center flex-wrap">
                    <span className="text-blue-300 font-bold mr-1">Note: </span>
                    <ExchangeIcon exchange={'coinspot'} withLabel /> doesn't have a low-fee{' '}
                    <span className="text-blue-300 font-bold">SOL/AUD</span>
                    market!
                </span>
            </div>
            <span className="sm:text-sm text-xs text-blue-100 flex flex-col sm:flex-row">
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
