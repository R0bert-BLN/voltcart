import { cn } from 'cn'

export interface NoteProps extends React.ComponentProps<'p'> {
  /** Notice text; omit for the brief's default legal note. */
  text?: string
}

/** Notice from the mockup (MK.ui.note → .note): a soft warning paragraph,
    by default the brief's legal note. */
export function Note({
  text = 'Requires legal validation before implementation.',
  className,
  ...props
}: NoteProps) {
  return (
    <p
      role="note"
      data-slot="note"
      className={cn(
        'rounded-[var(--radius-md)] bg-warning-soft p-3 text-sm text-warning',
        className,
      )}
      {...props}
    >
      {text}
    </p>
  )
}
