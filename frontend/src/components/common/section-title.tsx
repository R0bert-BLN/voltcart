import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface SectionTitleProps {
  title: string
  action?: ReactNode
  className?: string
}

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
