import type { ReactNode } from 'react'

import { cn } from 'cn'

export interface ListRowProps {
  /** Row title, the main line. */
  title: string
  /** Second line under the title, rendered muted and small. */
  subtitle?: string
  /** Leading slot (thumbnail, icon) before the text. */
  lead?: ReactNode
  /** Trailing slot (price, badge, actions) after the text. */
  trail?: ReactNode
  /** Render the row as a link that navigates here. */
  href?: string
  className?: string
}

const rowBody = (lead: ReactNode, title: string, subtitle: string | undefined, trail: ReactNode) => (
  <>
    {lead ?? null}
    <div className="grow min-w-0 [overflow-wrap:anywhere]">
      <div>{title}</div>
      {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
    </div>
    {trail ?? null}
  </>
)

/** One row of the mockup list (MK.ui.listRow → .list-row): lead slot, title with
    an optional muted subtitle, and a trailing slot; with a href it is an anchor. */
export function ListRow({ title, subtitle, lead, trail, href, className }: ListRowProps) {
  const classes = cn(
    'flex items-center gap-3 min-h-12 px-4 py-2',
    '[&_[data-slot=icon]]:size-(--fs-sm)',
    className,
  )

  if (href) {
    return (
      <a
        href={href}
        data-slot="list-row"
        className={cn(classes, 'no-underline hover:bg-surface-2 focus-visible:bg-surface-2')}
      >
        {rowBody(lead, title, subtitle, trail)}
      </a>
    )
  }

  return (
    <div data-slot="list-row" className={classes}>
      {rowBody(lead, title, subtitle, trail)}
    </div>
  )
}

/** Boxed list from the mockup (MK.ui.list → .list): rows separated by borders. */
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
