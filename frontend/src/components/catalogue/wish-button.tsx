import { cn } from 'cn'

import { Icon } from '@/components/ui/icon'

export interface WishButtonProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** Toggle state; the wish list is owned by the caller (mockup app.js). */
  pressed: boolean
  /** Fired on click; pass nothing for a display-only button. */
  onToggle?: () => void
}

/** Wish button from the mockup (MK.ui.wishButton → .wish-btn): a round
    icon-btn with a heart that fills and turns accent colour while pressed. */
export function WishButton({ pressed, onToggle, onClick, className, ...props }: WishButtonProps) {
  return (
    <button
      type="button"
      data-slot="wish-button"
      aria-pressed={pressed}
      aria-label={pressed ? 'Remove from wish list' : 'Add to wish list'}
      onClick={(event) => {
        onToggle?.()
        onClick?.(event)
      }}
      className={cn(
        'grid size-(--control) pointer-coarse:size-11 cursor-pointer place-items-center rounded-[var(--radius-md)] bg-transparent text-text transition-colors outline-none',
        'hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-ring/50',
        pressed && 'text-accent-strong',
        className,
      )}
      {...props}
    >
      <Icon name="Heart" aria-hidden="true" className={cn('fill-transparent', pressed && 'fill-current')} />
    </button>
  )
}
