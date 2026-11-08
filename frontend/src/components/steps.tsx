import { cn } from 'cn'
import { Icon } from '@/components/ui/icon'

export interface StepItem {
  label: string
  /** Pass the step's own route to link back to it. */
  href?: string
}

export interface StepsProps extends React.ComponentProps<'ol'> {
  /** 1-based number of the current step; earlier steps show a check. */
  current: number
  items: StepItem[]
}

const stepButton =
  'flex items-center gap-2 py-2 -my-2 no-underline hover:text-primary hover:underline ' +
  'pointer-coarse:my-0 pointer-coarse:min-h-11 focus-visible:rounded-[var(--radius-md)] ' +
  'focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring'

/** Numbered checkout steps from the mockup (MK.ui.steps → .steps): the number
    in a pill, the current step filled and emphasised, steps before it checked
    and linking back via their href. */
export function Steps({ current, items, className, ...props }: StepsProps) {
  return (
    <ol
      aria-label={`Checkout, step ${current} of ${items.length}`}
      data-slot="steps"
      className={cn('flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-text-muted', className)}
      {...props}
    >
      {items.map((item, index) => {
        const number = index + 1
        const done = number < current
        const num = (
          <span
            className={cn(
              'grid size-6 place-items-center rounded-full border border-border-strong bg-surface tabular-nums',
              done && 'border-primary-soft bg-primary-soft text-primary',
              !done && number === current && 'border-primary bg-primary text-(--text-on-primary)',
            )}
          >
            {done ? <Icon name="Check" className="size-(--fs-sm)" /> : number}
          </span>
        )

        return (
          <li
            key={item.label}
            aria-current={number === current ? 'step' : undefined}
            className={cn(number === current && 'font-(--fw-medium) text-text', className)}
          >
            {item.href ? (
              <a href={item.href} className={stepButton}>
                {num}
                {item.label}
              </a>
            ) : (
              <span className="flex items-center gap-2">
                {num}
                {item.label}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
