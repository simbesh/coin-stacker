import { cn } from '@/lib/utils'
import type React from 'react'

interface NewBadgeProps {
    className?: string
}

const NewBadge: React.FC<NewBadgeProps> = ({ className = '' }) => {
    return (
        <div className={cn('inline-block scale-85', className)}>
            <div className="rounded-full bg-linear-to-r from-yellow-400 via-red-500 to-pink-500 p-[2px]">
                <div className="rounded-full bg-white pl-2 pr-3 dark:bg-gray-900">
                    <div className=" flex items-center justify-center text-nowrap bg-linear-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-sm font-bold text-transparent">
                        <span className="text-lg">✨</span>
                        <span className="">New</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewBadge
