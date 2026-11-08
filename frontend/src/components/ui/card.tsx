import { cn } from 'cn'

export interface CardProps extends React.ComponentProps<'section'> {
  /** Render as a link card that navigates to this href instead of a section. */
  href?: string
}

/**
 * Surface from the mockup (.card): flex column, Surface gap, Surface-5 padding,
 * Surface radius, Border border. A link card flips on Primary border on hover.
 */
export function Card({ className, href, children, ...props }: CardProps) {
  const classes = cn(
    'card flex flex-col gap-2 rounded-[var(--radius-lg)] border bg-card p-5 transition-colors outline-none',
    href &&
      'hover:border-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1',
    className,
  )

  if (href) {
    // A link card is an <a>; the anchor branch drops the section-only ref.
    const anchorProps = props as Omit<React.ComponentProps<'a'>, 'ref'>

    return (
      <a href={href} data-slot="card" className={classes} {...anchorProps}>
        {children}
      </a>
    )
  }

  return (
    <section data-slot="card" className={classes} {...props}>
      {children}
    </section>
  )
}
