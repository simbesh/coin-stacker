import { Switch } from './ui/switch'
import { cn } from '@/lib/utils'

interface LabeledSwitchProps {
    label: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    disabled?: boolean
    size?: 'xs' | 'sm' | 'default'
}

export function LabeledSwitch({ label, checked, onCheckedChange, disabled = false, size = 'xs' }: LabeledSwitchProps) {
    return (
        <label className="flex w-full items-center justify-between gap-2 hover:ring-1 hover:ring-muted p-1 rounded-md">
            <span className={cn('text-xs', disabled && 'opacity-60')}>{label}</span>
            <Switch size={size} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
        </label>
    )
}
