import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function currencyFormat(num: number, currencyCode: string = "AUD", digits: number = 2): string {
    const options = {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }
    return new Intl.NumberFormat("en-AU", options).format(num)
}
