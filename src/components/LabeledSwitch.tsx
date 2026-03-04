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
        <button
            aria-disabled={disabled}
            aria-pressed={checked}
            className={cn(
                'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md p-1 hover:ring-1 hover:ring-muted',
                disabled && 'opacity-60',
            )}
            onClick={(_event) => {
                if (!disabled) {
                    onCheckedChange(!checked)
                }
            }}
            onKeyDown={(event) => {
                if (disabled) {
                    return
                }
                if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault()
                    onCheckedChange(!checked)
                }
            }}
            tabIndex={disabled ? -1 : 0}
            type="button"
        >
            <span className="text-xs">{label}</span>
            <Switch disabled={disabled} size={size} />
        </button>
    )
}
