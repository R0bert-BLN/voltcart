import { cn } from '@/lib/utils'
import { AppLink } from '@/components/common/app-link'
import { Icon, type IconName } from '@/components/ui/icon'

export type StatTone = '' | 'warning' | 'danger'

const toneBox = {
  '': 'bg-primary-soft text-primary',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
} as const satisfies Record<StatTone, string>

export interface StatProps {
  label: string
  value: string | number
  icon: IconName
  tone?: StatTone
  href?: string
  className?: string
}

export function Stat({ label, value, icon, tone = '', href, className, ...props }: StatProps) {
  const classes = cn(
    'flex flex-col items-start gap-1 rounded-[var(--radius-lg)] border bg-surface p-5 text-left',
    'transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
    href && 'hover:border-primary focus-visible:border-ring no-underline',
    className,
  )
  const body = (
    <>
      <span
        data-slot="stat-icon"
        data-tone={tone}
        className={cn('mb-2 grid size-[34px] place-items-center rounded-[var(--radius-md)]', toneBox[tone])}
      >
        <Icon name={icon} aria-hidden="true" />
      </span>
      <span
        data-slot="stat-value"
        className="text-(--fs-2xl) font-(--fw-semibold) leading-(--lh-tight) tabular-nums"
      >
        {value}
      </span>
      <span data-slot="stat-label" className="text-sm text-text-muted">
        {label}
      </span>
    </>
  )

  if (href) {
    return (
      <AppLink href={href} data-slot="stat" data-tone={tone} className={classes} {...props}>
        {body}
      </AppLink>
    )
  }

  return (
    <div data-slot="stat" data-tone={tone} className={classes} {...props}>
      {body}
    </div>
  )
}
