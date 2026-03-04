// source: https://github.com/shadcn-ui/ui/issues/2402#issuecomment-1930895113
'use client'

import type { PopoverContentProps, PopoverProps, PopoverTriggerProps } from '@radix-ui/react-popover'
import type { TooltipContentProps, TooltipProps, TooltipTriggerProps } from '@radix-ui/react-tooltip'
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const TouchContext = createContext<boolean | undefined>(undefined)
const useTouch = () => useContext(TouchContext)

export const TouchProvider = (props: PropsWithChildren) => {
    const [isTouch, setTouch] = useState<boolean>()

    useEffect(() => {
        setTouch(window.matchMedia('(pointer: coarse)').matches)
    }, [])

    return <TouchContext.Provider value={isTouch} {...props} />
}

export const HybridTooltip = (props: TooltipProps & PopoverProps) => {
    const isTouch = useTouch()

    return isTouch ? <Popover {...props} /> : <Tooltip delayDuration={0} {...props} />
}

export const HybridTooltipTrigger = (props: TooltipTriggerProps & PopoverTriggerProps) => {
    const isTouch = useTouch()

    return isTouch ? <PopoverTrigger {...props} /> : <TooltipTrigger {...props} />
}

export const HybridTooltipContent = (props: TooltipContentProps & PopoverContentProps) => {
    const isTouch = useTouch()

    return isTouch ? <PopoverContent {...props} className="w-fit" /> : <TooltipContent {...props} />
}
