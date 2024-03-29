'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function useMutableSearchParams<T>() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const urlSearchParams = new URLSearchParams(searchParams.toString())

    function setSearchParams(params: Partial<T>) {
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                urlSearchParams.delete(key)
            } else {
                urlSearchParams.set(key, String(value))
            }
        })

        const search = urlSearchParams.toString()
        const query = search ? `?${search}` : ''
        // replace since we don't want to build a history
        router.replace(`${pathname}${query}`)
    }

    return { searchParams, setSearchParams }
}
