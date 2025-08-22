'use client'

import ClientOnly from '@/components/ClientOnly'
import Feedback from '@/components/Feedback'
import GeneralSettings from '@/components/GeneralSettings'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LocalStorageKeys } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useLocalStorage, useWindowScroll } from '@uidotdev/usehooks'
import { Home, Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler'
import WithdrawalFeeDialog from './WithdrawalFeeDialog'

const items = [
    {
        id: 'nav-link-home',
        title: 'Home',
        href: '/',
        activeSegment: null,
        icon: <Home />,
    },
    // {
    //     id: 'nav-link-exchange-fees',
    //     title: 'Exchange Fees',
    //     href: '/exchange-fees',
    //     activeSegment: 'exchange-fees',
    //     icon: <LineChart />,
    // },
]
const defaultNavBackground = 'bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur dark:border dark:border-transparent'
const NavBar = () => {
    const [sheetOpen, setSheetOpen] = useState(false)
    const activeSegment = useSelectedLayoutSegment()
    const [{ y }] = useWindowScroll()
    const [barBg, setBarBg] = useState(defaultNavBackground)
    const [withdrawalFeeDialogDismissed] = useLocalStorage(LocalStorageKeys.WithdrawalFeeDialogDismissed, false)

    useEffect(() => {
        if (y && y > 1) {
            setBarBg(
                'bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur dark:border-b-border dark:border drop-shadow-lg dark:drop-shadow-none'
            )
        } else {
            setBarBg(defaultNavBackground)
        }
    }, [y])

    return (
        <nav className={cn('sticky top-0 z-50 flex w-full p-2 transition-all duration-300', barBg)}>
            <div className={'block sm:hidden'}>
                <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Open Navigation Menu">
                            <Menu className="size-[1.2rem]" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side={'left'}>
                        <SheetHeader>
                            <SheetTitle>CoinStacker</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col">
                            {items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        'flex gap-2 py-4 ',
                                        activeSegment === item.activeSegment
                                            ? 'text-primary font-semibold'
                                            : 'text-muted-foreground'
                                    )}
                                    onClick={() => {
                                        setSheetOpen(false)
                                    }}
                                >
                                    {item.icon}
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <Link href={'/'} className={'ml-auto flex items-center gap-2 sm:ml-0'}>
                <Image src={'/coinstacker-logo.png'} alt={'coinstacker-logo'} width={40} height={24} />
                <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                    CoinStacker
                </span>
            </Link>
            <div className="ml-12 mr-auto hidden w-full items-center sm:flex sm:w-auto" id="navbar-default">
                <div className="mt-4 flex rounded-lg border border-gray-100 p-4 font-medium sm:mt-0 sm:flex-row sm:space-x-4 sm:border-0 sm:p-0 dark:border-gray-700">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                'rounded-md p-3 hover:bg-slate-200 dark:hover:bg-slate-800',
                                activeSegment === item.activeSegment
                                    ? 'text-primary font-semibold'
                                    : 'text-muted-foreground hover:text-secondary-foreground    '
                            )}
                        >
                            {item.title}
                        </Link>
                    ))}
                </div>
            </div>
            <div className={'ml-auto flex items-center gap-1 sm:gap-2 sm:ml-0'}>
                <WithdrawalFeeDialog defaultOpen={!withdrawalFeeDialogDismissed} />
                <div className={'hidden sm:block'}>
                    <Feedback />
                </div>
                <ClientOnly>
                    <GeneralSettings />
                </ClientOnly>
                <AnimatedThemeToggler />
            </div>
        </nav>
    )
}

export default NavBar
