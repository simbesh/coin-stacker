import type React from 'react'
import { cn } from '@/lib/utils'

interface NewBadgeProps {
    className?: string
}

const NewBadge: React.FC<NewBadgeProps> = ({ className = '' }) => {
    return (
        <div className={cn('inline-block scale-85', className)}>
            <div className="rounded-full bg-linear-to-r from-yellow-400 via-red-500 to-pink-500 p-[2px]">
                <div className="rounded-full bg-white pr-3 pl-2 dark:bg-gray-900">
                    <div className="flex items-center justify-center text-nowrap bg-linear-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text font-bold text-sm text-transparent">
                        <span className="text-lg">✨</span>
                        <span className="">New</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewBadge
