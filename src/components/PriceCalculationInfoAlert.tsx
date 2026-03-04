import { useLocalStorage } from '@uidotdev/usehooks'
import { X } from 'lucide-react'

export function PriceCalculationInfoAlert({ onClick }: { onClick: () => void }) {
    const [hide, setHide] = useLocalStorage('hide-price-calculation-info', false)

    if (hide) {
        return null
    }

    return (
        <div className="my-2 w-full max-w-fit rounded-full border border-blue-400 bg-slate-50 hover:bg-slate-200 dark:border-blue-950 dark:bg-slate-950/70 dark:hover:bg-slate-900/70">
            <div className="relative">
                <button
                    className="flex w-full cursor-pointer flex-wrap items-center gap-1 p-2 px-12 text-slate-700 text-sm hover:text-slate-900 sm:text-sm dark:text-slate-300 dark:hover:text-slate-50"
                    onClick={onClick}
                    type="button"
                >
                    <span className="mr-1 font-semibold underline">How are these prices calculated?</span>
                </button>
                <button
                    aria-label="Dismiss price calculation info"
                    className="absolute top-1/2 right-0 mx-1 -translate-y-1/2 rounded-full p-2 hover:bg-slate-50 dark:hover:bg-slate-950"
                    onClick={(event) => {
                        event.preventDefault()
                        setHide(true)
                    }}
                    type="button"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    )
}
