import { cn } from '@/lib/utils'

export type ChipItem = string | { value: string; label: string }

const toChip = (item: ChipItem): { value: string; label: string } =>
  typeof item === 'string' ? { value: item, label: item } : item

export interface ChipsProps {
  items: ChipItem[]
  selected?: string | null
  label?: string
  onChipChange?: (value: string) => void
  className?: string
}

export function Chips({ items, selected, label = 'Filter', onChipChange, className }: ChipsProps) {
  return (
    <div role="group" aria-label={label} data-slot="chips" className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => {
        const { value, label: text } = toChip(item)
        const isPressed = value === selected
        return (
          <button
            type="button"
            key={value}
            data-chip={value}
            aria-pressed={isPressed}
            onClick={() => onChipChange?.(value)}
            className={cn(
              'pointer-coarse:min-h-11 min-h-(--control) cursor-pointer rounded-full px-4 text-sm transition-colors',
              'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              isPressed
                ? 'border border-primary bg-primary font-medium text-primary-foreground'
                : 'border border-border-strong bg-surface text-text hover:bg-surface-2',
            )}
          >
            {text}
          </button>
        )
      })}
    </div>
  )
}
