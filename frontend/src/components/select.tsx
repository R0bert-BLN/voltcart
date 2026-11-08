import { useId } from 'react'

import { cn } from 'cn'
import { Icon } from '@/components/ui/icon'

export interface SelectProps extends Omit<React.ComponentProps<'select'>, 'id' | 'children'> {
  /** Label text above the control. */
  label: string
  /** Choices; strings, or { value, label } when they differ. */
  options: Array<string | { value: string; label: string }>
  /** Static help line under the control. */
  hint?: string
  /** Validation message; marks the control invalid and links it via aria-describedby. */
  error?: string
  /** Text of the disabled first option; omit for no placeholder. */
  placeholder?: string
  /** Pairs with name in form markup; generated when omitted. */
  id?: string
}

/** Labelled select from the mockup (MK.ui.select → .field): a label, the
    native control with a focus ring, an optional placeholder option, help
    line and inline error. */
export function Select({
  label,
  options,
  hint,
  error,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? `f-${autoId}`
  const hintId = `${selectId}-hint`
  const errorId = `${selectId}-error`

  return (
    <div data-slot="select" className={cn('flex flex-col gap-1 text-sm', className)}>
      <label className="font-medium" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && hintId, error && errorId) || undefined}
        className={cn(
          'pointer-coarse:min-h-11 min-h-(--control) w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 text-base outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-text-muted',
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => {
          const { value, label: text } =
            typeof option === 'string' ? { value: option, label: option } : option
          return (
            <option key={value} value={value}>
              {text}
            </option>
          )
        })}
      </select>
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
