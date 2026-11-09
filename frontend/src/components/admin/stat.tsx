import { Link, type LinkProps } from '@tanstack/react-router'

import { cn } from 'cn'
import { Icon, type IconName } from '@/components/ui/icon'

export type StatTone = '' | 'warning' | 'danger'

const toneBox = {
  '': 'bg-primary-soft text-primary',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
} as const satisfies Record<StatTone, string>

export interface StatProps {
  /** Small caption under the value. */
  label: string
  /** The number or short text between the icon and the label. */
  value: string | number
  /** Leading lucide icon in the tone box. */
  icon: IconName
  /** Soft colour of the icon box; omit for the primary tone. */
  tone?: StatTone
  /** Render as a link tile that navigates here instead of a plain tile. */
  href?: string
  className?: string
}

/** Number tile from the mockup (MK.ui.stat → .stat): a soft tone icon box, the
    big tabular value and the muted label; with a href it is a link tile. */
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
      // The router link, so the tile navigates within the app in place of a
      // full page load.
      <Link
        to={href as LinkProps['to']}
        data-slot="stat"
        data-tone={tone}
        className={classes}
        {...props}
      >
        {body}
      </Link>
    )
  }

  return (
    <div data-slot="stat" data-tone={tone} className={classes} {...props}>
      {body}
    </div>
  )
}
