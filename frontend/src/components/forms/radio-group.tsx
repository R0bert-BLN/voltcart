import { cn } from '@/lib/utils'

export interface RadioGroupProps extends React.ComponentProps<'div'> {
  label: string
}

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
