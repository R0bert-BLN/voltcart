import { useId } from 'react'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

export interface FieldProps extends Omit<React.ComponentProps<'input'>, 'id'> {
  label: string
  hideLabel?: boolean
  hint?: string
  error?: string
  id?: string
}

export function Field({ label, hideLabel, hint, error, className, id, ...props }: FieldProps) {
  const autoId = useId()
  const inputId = id ?? `f-${autoId}`
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`

  return (
    <div data-slot="field" className={cn('flex flex-col gap-1 text-sm', className)}>
      <label className={cn('font-medium', hideLabel && 'sr-only')} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && hintId, error && errorId) || undefined}
        className={cn(
          'pointer-coarse:min-h-11 min-h-(--control) w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 text-base outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-muted',
        )}
        {...props}
      />
      {hint ? (
        <span id={hintId} className="text-sm text-text-muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} role="alert" className="flex items-center gap-1 text-sm text-danger">
          <Icon name="CircleExclamationPoint" className="size-(--fs-sm)" />
          {error}
        </span>
      ) : null}
    </div>
  )
}
