import { cn } from 'cn'

export interface RadioCardProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Card title, the first line. */
  title: string
  /** Muted second line under the title. */
  text?: string
  /** Trailing slot (price, badge) after the text. */
  trail?: React.ReactNode
}

/** Radio as a card from the mockup (MK.ui.radioCard → .radio-card): the whole
    card is the label; selecting it highlights the card with the primary tint. */
export function RadioCard({ title, text, trail, className, ...props }: RadioCardProps) {
  return (
    <label
      data-slot="radio-card"
      className={cn(
        'flex min-h-13.5 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-2',
        'transition-colors hover:border-primary',
        'has-checked:border-primary has-checked:bg-primary-soft',
        'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
        'has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <input type="radio" className="size-(--icon) flex-none accent-primary" {...props} />
      <span className="grow min-w-0">
        {title}
        {text ? <span className="block text-sm text-muted-foreground">{text}</span> : null}
      </span>
      {trail ? <span className="tabular-nums">{trail}</span> : null}
    </label>
  )
}
