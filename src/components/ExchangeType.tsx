import { BookOpenText, HandCoins } from 'lucide-react'
import { InformationIcon } from './ui/information-icon'

interface ExchangeTypeProps {
    type?: 'orderbook' | 'broker'
}

const ExchangeType = ({ type }: ExchangeTypeProps) => {
    if (!type) return null

    const config = {
        orderbook: {
            icon: BookOpenText,
            variant: 'orderbook' as const,
            title: 'Order Book Exchange',
            description: 'Prices are set by the market (users)',
        },
        broker: {
            icon: HandCoins,
            variant: 'broker' as const,
            title: 'Broker Exchange',
            description: 'Prices are set by the exchange',
        },
    }

    const { icon, variant, title, description } = config[type]

    return <InformationIcon icon={icon} variant={variant} title={title} description={description} />
}

export default ExchangeType
