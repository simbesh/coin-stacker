import React from 'react'
import { cn } from '@/lib/utils'
import { GeistSans } from 'geist/font/sans'

const SplashScreen = ({ isLoading }: { isLoading: boolean }) => {
    return (
        <div
            id={'splash'}
            className={cn(
                'min-w-screen fixed top-0 flex h-screen min-h-screen w-screen transition-all duration-300',
                isLoading ? 'z-50 opacity-100' : 'z-[-10] opacity-0'
            )}
        >
                <img src={'/coinstacker-logo-256.png'} className={'m-auto'} alt={'coinstacker-logo'} />
        </div>
    )
}

export default SplashScreen
