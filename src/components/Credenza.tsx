'use client'

import * as React from 'react'
import { useMediaQuery } from '@uidotdev/usehooks'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

type BaseProps = {
    children: React.ReactNode
}

interface RootCredenzaProps extends BaseProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

interface CredenzaProps extends BaseProps {
    className?: string
    asChild?: true
    onOpenAutoFocus?: (event: Event) => void
}

const CredenzaContext = React.createContext<{ isMobile: boolean }>({
    isMobile: false,
})

const useCredenzaContext = () => {
    const context = React.useContext(CredenzaContext)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (context === undefined) {
        throw new Error('Credenza components cannot be rendered outside the Credenza Context')
    }
    return context
}

const Credenza = ({ children, ...props }: RootCredenzaProps) => {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const CredenzaInner = isMobile ? Drawer : Dialog

    return (
        <CredenzaContext.Provider value={{ isMobile }}>
            <CredenzaInner {...props} {...(isMobile && { autoFocus: true })}>
                {children}
            </CredenzaInner>
        </CredenzaContext.Provider>
    )
}

const CredenzaTrigger = ({ className, children, ...props }: CredenzaProps) => {
    const { isMobile } = useCredenzaContext()
    const CredenzaTriggerInner = isMobile ? DrawerTrigger : DialogTrigger

    return (
        <CredenzaTriggerInner className={className} {...props}>
            {children}
        </CredenzaTriggerInner>
    )
}

const CredenzaClose = ({ className, children, ...props }: CredenzaProps) => {
    const { isMobile } = useCredenzaContext()
    const CredenzaCloseInner = isMobile ? DrawerClose : DialogClose

    return (
        <CredenzaCloseInner className={className} {...props}>
            {children}
        </CredenzaCloseInner>
    )
}

const CredenzaContent = ({ className, children, ...props }: CredenzaProps) => {
    const { isMobile } = useCredenzaContext()
    const CredenzaContentInner = isMobile ? DrawerContent : DialogContent

    return (
        <CredenzaContentInner className={className} {...props}>
            {children}
        </CredenzaContentInner>
    )
}

const CredenzaDescription = ({ className, children, ...props }: CredenzaProps) => {
    const { isMobile } = useCredenzaContext()
    const CredenzaDescriptionInner = isMobile ? DrawerDescription : DialogDescription

    return (
        <CredenzaDescriptionInner className={className} {...props}>
            {children}
        </CredenzaDescriptionInner>
    )
}

const CredenzaHeader = ({ className, children, ...props }: CredenzaProps) => {
    const { isMobile } = useCredenzaContext()
    const CredenzaHeaderInner = isMobile ? DrawerHeader : DialogHeader

    return (
        <CredenzaHeaderInner className={className} {...props}>
            {children}
        </CredenzaHeaderInner>
    )
}

const CredenzaTitle = ({ className, children, ...props }: CredenzaProps) => {
    const { isMobile } = useCredenzaContext()
    const CredenzaTitleInner = isMobile ? DrawerTitle : DialogTitle

    return (
        <CredenzaTitleInner className={className} {...props}>
            {children}
        </CredenzaTitleInner>
    )
}

const CredenzaBody = ({ className, children, ...props }: CredenzaProps) => {
    return (
        <div className={cn('px-4 md:px-0', className)} {...props}>
            {children}
        </div>
    )
}

const CredenzaFooter = ({ className, children, ...props }: CredenzaProps) => {
    const { isMobile } = useCredenzaContext()
    const CredenzaFooterInner = isMobile ? DrawerFooter : DialogFooter

    return (
        <CredenzaFooterInner className={className} {...props}>
            {children}
        </CredenzaFooterInner>
    )
}

export {
    Credenza,
    CredenzaTrigger,
    CredenzaClose,
    CredenzaContent,
    CredenzaDescription,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
    CredenzaFooter,
}
