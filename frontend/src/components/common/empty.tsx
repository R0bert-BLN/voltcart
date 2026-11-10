import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/components/ui/icon'

export interface EmptyProps extends React.ComponentProps<'div'> {
  icon: IconName
  title: string
  text?: string
  action?: ReactNode
}

export function Empty({ icon, title, text, action, children, className, ...props }: EmptyProps) {
  return (
    <div
      role="status"
      data-slot="empty"
      className={cn(
        'flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-surface p-6 text-center',
        className,
      )}
      {...props}
    >
      <span className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon name={icon} className="size-7" />
      </span>
      <h2>{title}</h2>
      {text ? <p className="text-sm text-text-muted">{text}</p> : null}
      {action ?? children ?? null}
    </div>
  )
}
