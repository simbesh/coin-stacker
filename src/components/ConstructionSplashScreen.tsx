"use client"
import {useLocalStorage} from "@uidotdev/usehooks";
import React from 'react'
import {cn} from '@/lib/utils'

const SplashScreen = ({isLoading}: { isLoading: boolean }) => {
    const [bypass] = useLocalStorage("bypass-splash");
    if (!bypass) {
        return (
            <div
                id={'splash'}
                className={cn(
                    'min-w-screen fixed top-0 flex h-screen min-h-screen w-screen transition-all duration-300',
                    isLoading ? 'z-50 opacity-100' : 'z-[-10] opacity-0'
                )}
            >
                <div className={cn('m-auto')}>
                    <img src={'/coinstacker-logo-256.png'} className={'m-auto'} alt={'coinstacker-logo'}/>
                    <h2 className={'text-6xl font-semibold'}>Coming soon.</h2>
                </div>
            </div>
        )

    }

    return (
        <div
            id={'splash'}
            className={cn(
                'min-w-screen fixed top-0 flex h-screen min-h-screen w-screen transition-all duration-300',
                isLoading ? 'z-50 opacity-100' : 'z-[-10] opacity-0'
            )}
        >
            <div className={cn('m-auto')}>
                <img src={'/coinstacker-logo-256.png'} className={'m-auto'} alt={'coinstacker-logo'}/>
            </div>
        </div>
    )
}

export default SplashScreen
