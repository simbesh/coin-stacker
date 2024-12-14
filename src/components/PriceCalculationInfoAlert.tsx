import { useLocalStorage } from '@uidotdev/usehooks'
import { X } from 'lucide-react'

export function PriceCalculationInfoAlert({ onClick }: { onClick: () => void }) {
    const [hide, setHide] = useLocalStorage('hide-price-calculation-info', false)

    if (hide) return null

    return (
        <div
            onClick={onClick}
            className="w-full max-w-fit rounded-full border border-blue-400 dark:border-blue-950 bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-200 dark:hover:bg-slate-900/70 cursor-pointer my-2"
        >
            <div className="relative">
                <span className="flex flex-wrap items-center gap-1 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 sm:text-sm p-2 px-12 ">
                    <span className="mr-1 font-semibold underline">How are these prices calculated?</span>
                </span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-2 mx-1 hover:bg-slate-50 dark:hover:bg-slate-950">
                    <X
                        className="size-4"
                        onClick={(e) => {
                            e.stopPropagation()
                            setHide(true)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
