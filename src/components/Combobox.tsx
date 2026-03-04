'use client'

import { useLocalStorage, useMediaQuery } from '@uidotdev/usehooks'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import Coin from './CoinIcon'

interface Props {
    className?: string
    options: { label: ReactNode | string; value: string }[]
    optionType?: string
    setValue: (value: string) => void
    value: string
}
export function Combobox({ className, options, value, setValue, optionType = 'option' }: Props) {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
    const [temporaryValues, setTemporaryValues] = useLocalStorage<string[]>(`${optionType}-values`, [])
    const joinedOptions = useMemo(() => {
        return [
            ...options,
            ...temporaryValues.map((value) => ({
                value,
                label: (
                    <div className={'flex items-center gap-2 font-semibold text-lg'} key={value}>
                        <Coin symbol={value} />
                        {value}
                    </div>
                ),
            })),
        ]
    }, [options, temporaryValues])

    const filteredOptions = useMemo(() => {
        return joinedOptions.filter(
            (option) =>
                option.value.toLowerCase().includes(searchValue.toLowerCase()) ||
                option.label?.toString().toLowerCase().includes(searchValue.toLowerCase()),
        )
    }, [joinedOptions, searchValue])

    // Check if search value would create a manual option
    const hasManualOption =
        searchValue.trim() !== '' &&
        filteredOptions.length === 0 &&
        !joinedOptions.some((option) => option.value.toLowerCase() === searchValue.toLowerCase())

    return (
        <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
                <Button
                    aria-expanded={open}
                    aria-label={`Select ${optionType}`}
                    className={cn('w-[200px] justify-between', className)}
                    role="combobox"
                    variant="outline"
                >
                    {value ? joinedOptions.find((option) => option.value === value)?.label : `Select ${optionType}`}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" onOpenAutoFocus={(e) => isSmallDevice && e.preventDefault()}>
                <Command>
                    <CommandInput
                        onValueChange={setSearchValue}
                        placeholder={`Search ${joinedOptions.length} ${optionType}s...`}
                        value={searchValue}
                    />
                    <CommandList>
                        {!hasManualOption && filteredOptions.length === 0 && (
                            <CommandEmpty>{`No ${optionType} found.`}</CommandEmpty>
                        )}
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? '' : currentValue.toUpperCase())
                                        setOpen(false)
                                        setSearchValue('')
                                    }}
                                    value={option.value}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 size-4',
                                            value === option.value ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                            {searchValue.trim() !== '' &&
                                !joinedOptions.some((option) => option.value === searchValue.toUpperCase()) && (
                                    <CommandItem
                                        key={`manual-${searchValue}`}
                                        onSelect={() => {
                                            setValue(searchValue.toUpperCase())
                                            setTemporaryValues([...temporaryValues, searchValue.toUpperCase()])
                                            setOpen(false)
                                            setSearchValue('')
                                        }}
                                        value={searchValue}
                                    >
                                        <Plus className="mr-2 size-4 opacity-50" />
                                        {searchValue.toUpperCase()}
                                    </CommandItem>
                                )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
