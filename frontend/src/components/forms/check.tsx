import { useId, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface CheckProps extends React.ComponentProps<'input'> {
  label: ReactNode
  error?: string
  id?: string
}

export function Check({ label, error, className, id, ...props }: CheckProps) {
  const autoId = useId()
  const inputId = id ?? `check-${autoId}`
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className={cn(
          'flex min-h-(--control) cursor-pointer items-center gap-2 py-2 text-sm',
          className,
        )}
      >
        <input
          id={inputId}
          type="checkbox"
          className="size-(--icon) accent-primary"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <span id={errorId} role="alert" className="flex items-center gap-1 text-sm text-danger">
          {error}
        </span>
      ) : null}
    </div>
  )
}
