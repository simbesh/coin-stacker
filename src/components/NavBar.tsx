'use client'

import Link from 'next/link'
import {useSelectedLayoutSegment} from 'next/navigation'
import React from 'react';
import Image from "next/image";
import {ThemeToggle} from "@/components/theme-toggle";

const items = [
    {
        id: 'nav-link-home',
        title: 'Home',
        href: '/',
        activeSegment: null,
    },
    {
        id: 'nav-link-exchange-fees',
        title: 'Exchange Fees',
        href: '/exchange-fees',
        activeSegment: 'exchange-fees',
    },
]

const NavBar = () => {
    const activeSegment = useSelectedLayoutSegment()

    return (
        <nav className={'w-full flex p-2'}>
            <Link href={'/'} className={'flex items-center gap-2'}>
                <Image src={'/coinstacker-logo.png'} alt={'coinstacker-logo'} width={40} height={24}/>
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">CoinStacker</span>

            </Link>
            <div className="hidden w-full md:flex md:w-auto ml-auto items-center" id="navbar-default">
                <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">

                    {items.map((item) => (
                        <li>
                            <Link
                                key={item.id}
                                href={item.href}
                                className={activeSegment === item.activeSegment ? 'text-primary font-semibold' : 'text-muted-foreground'}
                            >
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={'ml-auto'}>
                <ThemeToggle/>

            </div>
        </nav>
    )
};

export default NavBar;

