import { Credenza, CredenzaContent, CredenzaDescription, CredenzaTitle, CredenzaTrigger } from '@/components/Credenza'
import { useState } from 'react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

const HighlightedText = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-muted rounded-md px-1">{children}</span>
)

const HowCredenza = () => {
    const [open, setOpen] = useState(false)
    return (
        <Credenza open={open} onOpenChange={setOpen}>
            <CredenzaTrigger asChild>
                <Button variant={'link'} className="text-default" onClick={() => setOpen(true)}>
                    How are these prices calculated?
                </Button>
            </CredenzaTrigger>
            <CredenzaContent
                className="bg-card h-fit p-2 pt-6 transition-all duration-1000 sm:p-6"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <ScrollArea className="overflow-y-auto">
                    <CredenzaTitle className="text-left">How are these prices calculated?</CredenzaTitle>
                    <CredenzaDescription className="pb-8 text-left">
                        By simulating a market order on each exchange.
                    </CredenzaDescription>
                    <CredenzaTitle className="text-left">What is a market order?</CredenzaTitle>
                    <CredenzaDescription className="pb-8 text-left">
                        A market order is an order to buy or sell at the price currently available on the exchange.
                    </CredenzaDescription>
                    <CredenzaTitle className="mt-4 text-left">Example:</CredenzaTitle>
                    <div className="mt-2 grid grid-cols-12 gap-2 text-sm">
                        <div className="col-span-7 space-y-4 font-medium">
                            <p>Say if you wanted to buy 1.5 BTC. The price would be calculated as follows:</p>
                            <ul className="list-disc space-y-2 pl-4">
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
                        <div className="col-span-5 mt-2 grid grid-cols-2 text-right font-mono text-sm text-black dark:text-white">
                            <div className="font-medium">Price</div>
                            <div className="font-medium">Amount</div>
                            <div className="bg-red-100 p-2 dark:bg-red-900/50">$115,000</div>
                            <div className="bg-red-100 p-2 dark:bg-red-900/50">2.0</div>
                            <div className="bg-red-100 p-2 dark:bg-red-900/50">$110,000</div>
                            <div className="bg-red-100 p-2 dark:bg-red-900/50">3.0</div>
                            <div className="bg-red-100 p-2 dark:bg-red-900/50">$105,000</div>
                            <div className="bg-red-100 p-2 dark:bg-red-900/50">1.0</div>
                            <div className="col-span-2">&nbsp;</div>
                            <div className="bg-green-100 p-2 dark:bg-green-900/50">$100,000</div>
                            <div className="bg-green-100 p-2 dark:bg-green-900/50">2.0</div>
                            <div className="bg-green-100 p-2 dark:bg-green-900/50">$95,000</div>
                            <div className="bg-green-100 p-2 dark:bg-green-900/50">4.0</div>
                            <div className="bg-green-100 p-2 dark:bg-green-900/50">$90,000</div>
                            <div className="bg-green-100 p-2 dark:bg-green-900/50">6.0</div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="grid gap-2 py-4"></div>
            </CredenzaContent>
        </Credenza>
    )
}

export default HowCredenza
