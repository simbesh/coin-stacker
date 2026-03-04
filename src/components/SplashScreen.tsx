import Image from 'next/image'
import { cn } from '@/lib/utils'

const SplashScreen = ({ isLoading }: { isLoading: boolean }) => {
    return (
        <div
            className={cn(
                'fixed top-0 flex h-screen min-h-screen w-screen min-w-screen transition-all duration-300',
                isLoading ? 'z-50 opacity-100' : 'z-[-10] opacity-0',
            )}
            id={'splash'}
        >
            <Image
                alt={'CoinStacker logo'}
                className={'m-auto animate-breathe'}
                height={256}
                src={'/coinstacker-logo-256.png'}
                width={256}
            />
        </div>
    )
}

export default SplashScreen
