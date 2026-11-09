import { cn } from 'cn'

export interface RadioGroupProps extends React.ComponentProps<'div'> {
  /** Accessible name of the group, e.g. "Delivery method". */
  label: string
}

/** Labelled radio group from the mockup (MK.ui.radioGroup → .stack): wraps
    RadioCard rows so screen readers announce the group's name; keep one
    shared `name` across the radios so only one can be picked. */
export function RadioGroup({ label, className, children, ...props }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-slot="radio-group"
      className={cn('flex min-w-0 flex-col gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}
