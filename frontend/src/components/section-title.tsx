import type { ReactNode } from 'react'

import { cn } from 'cn'

export interface SectionTitleProps {
  title: string
  /** Trailing action (link, button) beside the title. */
  action?: ReactNode
  className?: string
}

/** Section heading from the mockup (MK.ui.sectionTitle → .section-title):
    an h2 with an optional trailing action on the same baseline. */
export function SectionTitle({ title, action, className }: SectionTitleProps) {
  return (
    <div
      data-slot="section-title"
      className={cn('flex items-baseline justify-between gap-4', className)}
    >
      <h2 className="text-xl font-semibold leading-tight">{title}</h2>
      {action ?? null}
    </div>
  )
}
