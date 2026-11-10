import { useId, type ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

export interface DialogProps {
  title: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function Sheet({ title, children, open = false, onOpenChange, className }: DialogProps) {
  const titleId = useId()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      hidden={!open}
      data-slot="sheet"
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4',
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onOpenChange?.(false)
      }}
      data-open={open || undefined}
    >
      <div
        className={cn(
          'sheet flex max-h-[85dvh] w-full max-w-(--dialog-w) flex-col gap-4 overflow-y-auto rounded-[var(--radius-lg)] bg-surface p-6 shadow-lg',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            data-close
            aria-label="Close"
            onClick={() => onOpenChange?.(false)}
            className="grid min-h-(--control) min-w-(--control) cursor-pointer place-items-center rounded-[var(--radius-md)] hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Icon name="X" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
