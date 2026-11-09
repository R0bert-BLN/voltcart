import { cn } from 'cn'
import { Icon } from '@/components/ui/icon'

export interface StepperProps extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
  /** Current value; the buttons disable at the bounds. */
  value?: number
  /** Inclusive minimum of the input; a value at it disables stepping down. */
  min?: number
  /** Inclusive maximum of the input; a value at it disables stepping up. */
  max?: number
  /** Accessible name of the whole group and of the input. */
  label?: string
  /** Called with the new value when a step button is pressed; typing in the
      input goes through the usual input props instead. */
  onValueChange?: (value: number) => void
}

const stepButton =
  'grid size-(--control) place-items-center outline-none transition-colors focus-visible:bg-surface-2 focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:size-11 disabled:cursor-not-allowed disabled:text-text-muted disabled:opacity-50'

/** Number stepper from the mockup (MK.ui.stepper → .stepper): a boxed group
    with minus, the value as a centred number input, and plus; the value stays
    owned by the caller and the buttons disable at the min and max. */
export function Stepper({ value = 1, min = 1, max = 99, label = 'Quantity', onValueChange, className, ...props }: StepperProps) {
  const stepTo = (direction: -1 | 1) => () => {
    const next = value + direction
    if (next >= min && next <= max) onValueChange?.(next)
  }

  return (
    <div
      data-slot="stepper"
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-[var(--radius-md)] border border-border-strong bg-surface',
        '[&>input]:appearance-none [&>input]:h-(--control) [&>input]:pointer-coarse:h-11 [&>input]:w-14 [&>input]:border-0 [&>input]:border-x [&>input]:bg-transparent [&>input]:text-center [&>input]:tabular-nums [&>input]:outline-none [&>input]:border-border',
        className,
      )}
    >
      <button type="button" data-step="-1" aria-label="Decrease" disabled={value <= min} onClick={stepTo(-1)} className={stepButton}>
        <Icon name="Minus" />
      </button>
      <input type="number" value={value} min={min} max={max} aria-label={label} {...props} />
      <button type="button" data-step="1" aria-label="Increase" disabled={value >= max} onClick={stepTo(1)} className={stepButton}>
        <Icon name="Plus" />
      </button>
    </div>
  )
}
