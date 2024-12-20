'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import posthog from 'posthog-js'

const menuItemStyle = {
    light: 'text-amber-600 bg-amber-200',
    dark: 'text-amber-500 bg-amber-950',
    system: 'text-amber-500 bg-amber-950',
}
export function ThemeToggle({ simple }: { simple?: boolean }) {
    const { theme, setTheme } = useTheme()

    if (!theme) {
        return null
    }

    function toggleTheme() {
        if (theme === 'light') {
            setTheme('dark')
            posthog.capture('set-theme', { theme: 'dark' })
        } else if (theme === 'system' || theme === 'dark') {
            setTheme('light')
            posthog.capture('set-theme', { theme: 'light' })
        }
    }

    if (simple) {
        return (
            <Button className="bg-transparent" variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="bg-transparent" variant="ghost" size="icon" aria-label="Toggle Light or Dark theme">
                    <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
