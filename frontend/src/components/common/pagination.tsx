import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

export interface PaginationProps {
  current: number
  total: number
  onPageChange?: (page: number) => void
  className?: string
}

const pageButton =
  'min-w-(--control) pointer-coarse:min-w-11 h-(--control) pointer-coarse:h-11 rounded-[var(--radius-md)] tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50'

export function Pagination({ current, total, onPageChange, className }: PaginationProps) {
  const pick = (page: number) => () => onPageChange?.(page)
  const pickProps = (page: number) => ({
    type: 'button' as const,
    'data-page': page,
    onClick: pick(page),
  })

  return (
    <nav
      data-slot="pagination"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <button
        aria-label="Previous page"
        disabled={current <= 1}
        {...pickProps(current - 1)}
        className={cn(pageButton, 'disabled:cursor-not-allowed disabled:text-text-muted disabled:opacity-50')}
      >
        <Icon name="ChevronLeft" />
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          aria-current={n === current ? 'page' : undefined}
          {...pickProps(n)}
          className={cn(
            pageButton,
            n === current ? 'bg-primary text-on-primary' : 'hover:bg-surface-2',
          )}
        >
          {n}
        </button>
      ))}
      <button
        aria-label="Next page"
        disabled={current >= total}
        {...pickProps(current + 1)}
        className={cn(pageButton, 'disabled:cursor-not-allowed disabled:text-text-muted disabled:opacity-50')}
      >
        <Icon name="ChevronRight" />
      </button>
    </nav>
  )
}
