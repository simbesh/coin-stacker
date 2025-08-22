import { OctagonAlert, PartyPopper, Pin, TrendingUpDown } from 'lucide-react'
import { InformationIcon } from './ui/information-icon'

export interface FeeTypeProps {
    type?: 'dynamic' | 'static' | 'unavailable' | 'free'
}

const FeeType = ({ type }: FeeTypeProps) => {
    if (!type) return null

    const config = {
        free: {
            icon: PartyPopper,
            variant: 'success' as const,
            title: 'Free',
            description: 'This Exchange does not charge withdrawal fees. Nice!',
        },
        dynamic: {
            icon: TrendingUpDown,
            variant: 'info' as const,
            title: 'Dynamic Fee',
            description: 'Fees change based on the network\n These fees are current and taken from the exchange',
        },
        static: {
            icon: Pin,
            variant: 'warning' as const,
            title: 'Static Fee',
            description: 'Fees are fixed and may become outdated.\nplease contact us if you see any issues.',
        },
        unavailable: {
            icon: OctagonAlert,
            variant: 'destructive' as const,
            title: 'Unavailable',
            description:
                'Exchange does not provide an easy method to retrieve fees\n\nTherefore fees are estimated based on the median\n of the fees from other exchanges',
        },
    }

    const { icon, variant, title, description } = config[type]

    return <InformationIcon icon={icon} variant={variant} title={title} description={description} />
}

export default FeeType
