'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookOpenText, Home, LineChart, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWindowScroll } from '@uidotdev/usehooks'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const items = [
    {
        id: 'nav-link-home',
        title: 'Home',
        href: '/',
        activeSegment: null,
        icon: <Home />,
    },
    // {
    //     id: 'nav-link-prices',
    //     title: 'Prices',
    //     href: '/prices',
    //     activeSegment: 'prices',
    //     icon: <BookOpenText />,
    // },
    {
        id: 'nav-link-exchange-fees',
        title: 'Exchange Fees',
        href: '/exchange-fees',
        activeSegment: 'exchange-fees',
        icon: <LineChart />,
    },
]
const defaultNavBackground = 'bg-slate-50 dark:bg-slate-900'
const NavBar = () => {
    const [sheetOpen, setSheetOpen] = useState(false)
    const activeSegment = useSelectedLayoutSegment()
    const [{ y }] = useWindowScroll()
    const [barBg, setBarBg] = useState(defaultNavBackground)
    useEffect(() => {
        if (y && y > 56) {
            setBarBg('bg-slate-50 dark:bg-slate-900 drop-shadow-lg')
        } else {
            setBarBg(defaultNavBackground)
        }
    }, [y])

    return (
        <nav className={cn('sticky top-0 z-50 flex w-full p-2 transition-all duration-300', barBg)}>
            <div className={'block sm:hidden'}>
                <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-[1.2rem] w-[1.2rem]" />
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
                                    onClick={() => setSheetOpen(false)}
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
            <div className="ml-16 mr-auto hidden w-full items-center sm:flex sm:w-auto" id="navbar-default">
                <ul className="mt-4 flex flex-col rounded-lg border border-gray-100 p-4 font-medium rtl:space-x-reverse dark:border-gray-700 sm:mt-0 sm:flex-row sm:space-x-8 sm:border-0 sm:p-0">
                    {items.map((item) => (
                        <li key={item.id}>
                            <Link
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
                        </li>
                    ))}
                </ul>
            </div>
            <div className={'ml-auto sm:ml-0'}>
                <ThemeToggle />
            </div>
        </nav>
    )
}

export default NavBar
