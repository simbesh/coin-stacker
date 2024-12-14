import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { PriceCalculationInfoAlert } from './PriceCalculationInfoAlert'

const HighlightedText = ({ children }: { children: React.ReactNode }) => (
    <span className="px-1 bg-muted rounded-md">{children}</span>
)

const HowDialog = () => {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <PriceCalculationInfoAlert onClick={() => setOpen(true)} />
            </DialogTrigger>
            <DialogContent
                className="bg-card h-fit transition-all duration-1000 p-2 pt-6 sm:p-6"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-left">How are these prices calculated?</DialogTitle>
                    <DialogDescription className="pb-8 text-left">
                        By simulating a market order on each exchange.
                    </DialogDescription>
                    <DialogTitle className="text-left">What is a market order?</DialogTitle>
                    <DialogDescription className="pb-8 text-left">
                        A market order is an order to buy or sell at the price currently available on the exchange.
                    </DialogDescription>
                    <DialogTitle className="text-left mt-4">Example:</DialogTitle>
                    <DialogDescription className="text-left">
                        <div className="grid grid-cols-12 mt-2 text-sm gap-2">
                            <div className="font-medium space-y-4 col-span-7">
                                <p>Say if you wanted to buy 1.5 BTC. The price would be calculated as follows:</p>
                                <ul className="list-disc pl-4 space-y-2">
                                    <li>The first 1.0 BTC would be bought at $105,000 = $105,000</li>
                                    <li>The next 0.5 BTC would be bought at $110,000 = $55,000</li>
                                    <li>
                                        The <span className="px-1 font-bold">total cost</span> would be:
                                        <br />
                                        $105,000 + $55,000 =<HighlightedText>$160,000</HighlightedText>
                                    </li>
                                    <li>
                                        The <span className="px-1 font-bold">average price</span> would be:
                                        <br />
                                        $160,000 / 1.5 BTC =<HighlightedText>$106,667</HighlightedText>
                                    </li>
                                </ul>
                            </div>
                            <div className="grid grid-cols-2 mt-2 font-mono dark:text-white text-black text-right col-span-5 text-sm">
                                <div className="font-medium">Price</div>
                                <div className="font-medium">Amount</div>
                                <div className="p-2 bg-red-100 dark:bg-red-900/50">$115,000</div>
                                <div className="p-2 bg-red-100 dark:bg-red-900/50">2.0</div>
                                <div className="p-2 bg-red-100 dark:bg-red-900/50">$110,000</div>
                                <div className="p-2 bg-red-100 dark:bg-red-900/50">3.0</div>
                                <div className="p-2 bg-red-100 dark:bg-red-900/50">$105,000</div>
                                <div className="p-2 bg-red-100 dark:bg-red-900/50">1.0</div>
                                <div className="col-span-2">&nbsp;</div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/50">$100,000</div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/50">2.0</div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/50">$95,000</div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/50">4.0</div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/50">$90,000</div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/50">6.0</div>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4"></div>
            </DialogContent>
        </Dialog>
    )
}

export default HowDialog
