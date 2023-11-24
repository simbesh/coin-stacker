'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const menuItemStyle = {
    light: 'text-amber-600 bg-amber-200',
    dark: 'text-amber-500 bg-amber-950',
    system: 'text-amber-500 bg-amber-950',
}
export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    if (!theme) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="bg-transparent" variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className={cn(theme === 'light' && menuItemStyle[theme])}
                    onClick={() => setTheme('light')}
                >
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    className={cn(theme === 'dark' && menuItemStyle[theme])}
                    onClick={() => setTheme('dark')}
                >
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    className={cn(theme === 'system' && menuItemStyle[theme])}
                    onClick={() => setTheme('system')}
                >
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
