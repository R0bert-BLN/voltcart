import { cn } from '@/lib/utils'

export type CardProps = React.ComponentProps<'section'>

export function Card({ className, children, ...props }: CardProps) {
  return (
    <section
      data-slot="card"
      className={cn(
        'card flex flex-col gap-2 rounded-[var(--radius-lg)] border bg-card p-5 transition-colors outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}
