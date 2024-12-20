'use client'

import { ReactNode, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMediaQuery } from '@uidotdev/usehooks'

type Props = {
    className?: string
    options: { label: ReactNode | string; value: string }[]
    value: string
    setValue: (value: string) => void
    optionType?: string
}
export function Combobox({ className, options, value, setValue, optionType = 'option' }: Props) {
    const [open, setOpen] = useState(false)
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label={`Select ${optionType}`}
                    className={cn('w-[200px] justify-between', className)}
                >
                    {value ? options.find((option) => option.value === value)?.label : `Select ${optionType}`}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" onOpenAutoFocus={(e) => isSmallDevice && e.preventDefault()}>
                <Command>
                    <CommandInput placeholder={`Search ${options.length} ${optionType}s...`} />
                    <ScrollArea className={'overflow-y-auto'}>
                        <CommandEmpty>{`No ${optionType} found.`}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? '' : currentValue.toUpperCase())
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 size-4',
                                            value === option.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
