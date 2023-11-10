"use client"

import {useIsClient} from '@uidotdev/usehooks';
import { type ReactNode } from 'react';

const ClientOnly = ({children, placeholder}: { children: ReactNode; placeholder?: ReactNode; }) => {
    const isClient = useIsClient()

    if (!isClient) {
        return null
    }

    return children
}

export default ClientOnly;