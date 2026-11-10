import type { ReactNode } from 'react'

import { AppLink } from '@/components/common/app-link'
import { cn } from '@/lib/utils'

export interface ListRowProps {
  title: string
  subtitle?: string
  lead?: ReactNode
  trail?: ReactNode
  href?: string
  className?: string
}

const rowBody = (lead: ReactNode, title: string, subtitle: string | undefined, trail: ReactNode) => (
  <>
    {lead}
    <div className="grow min-w-0 [overflow-wrap:anywhere]">
      <div>{title}</div>
      {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
    </div>
    {trail}
  </>
)

export function ListRow({ title, subtitle, lead, trail, href, className }: ListRowProps) {
  const classes = cn(
    'flex items-center gap-3 min-h-12 px-4 py-2',
    '[&_[data-slot=icon]]:size-(--fs-sm)',
    className,
  )

  if (href) {
    return (
      <AppLink
        href={href}
        data-slot="list-row"
        className={cn(classes, 'no-underline hover:bg-surface-2 focus-visible:bg-surface-2')}
      >
        {rowBody(lead, title, subtitle, trail)}
      </AppLink>
    )
  }

  return (
    <div data-slot="list-row" className={classes}>
      {rowBody(lead, title, subtitle, trail)}
    </div>
  )
}

export function List({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="list"
      className={cn(
        'flex flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-surface',
        '[&_[data-slot=list-row]+[data-slot=list-row]]:border-t',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
