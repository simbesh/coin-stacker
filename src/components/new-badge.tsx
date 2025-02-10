import type React from 'react'

interface NewBadgeProps {
    className?: string
}

const NewBadge: React.FC<NewBadgeProps> = ({ className = '' }) => {
    return (
        <div className={`inline-block transform scale-75 ${className}`}>
            <div className="bg-gradient-to-r to-pink-500 via-red-500 from-yellow-400 p-[2px] rounded-full">
                <div className="bg-white dark:bg-gray-900 rounded-full pl-2 pr-3">
                    <div className="text-sm font-bold bg-gradient-to-r to-pink-500 via-red-500 from-yellow-400 bg-clip-text text-transparent text-nowrap flex items-center justify-center">
                        <span className="text-lg">✨</span>
                        <span className="">New</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewBadge
