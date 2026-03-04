import { cn } from '@/lib/utils'
import { Switch } from './ui/switch'

interface LabeledSwitchProps {
    checked: boolean
    disabled?: boolean
    label: string
    onCheckedChange: (checked: boolean) => void
    size?: 'xs' | 'sm' | 'default'
}

export function LabeledSwitch({ label, checked, onCheckedChange, disabled = false, size = 'xs' }: LabeledSwitchProps) {
    return (
        <label className="flex w-full items-center justify-between gap-2 rounded-md p-1 hover:ring-1 hover:ring-muted">
            <span className={cn('text-xs', disabled && 'opacity-60')}>{label}</span>
            <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} size={size} />
        </label>
    )
}
