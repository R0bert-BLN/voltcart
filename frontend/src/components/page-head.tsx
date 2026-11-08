import type { ReactNode } from 'react'

import { cn } from 'cn'

export interface PageHeadProps {
  title: string
  subtitle?: string
  /** Actions for the trailing side (buttons, badges). */
  actions?: ReactNode
  className?: string
}

/** Page title from the mockup (.page-head): h1 with subtitle and trailing actions. */
export function PageHead({ title, subtitle, actions, className }: PageHeadProps) {
  return (
    <div
      data-slot="page-head"
      className={cn('flex flex-wrap items-start justify-between gap-4', className)}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-(--text-muted)">{subtitle}</p> : null}
      </div>
      {actions ? <div className="row flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
