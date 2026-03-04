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
            <img alt={'coinstacker-logo'} className={'m-auto animate-breathe'} src={'/coinstacker-logo-256.png'} />
        </div>
    )
}

export default SplashScreen
