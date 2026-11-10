import { useId } from 'react'

import { cn } from '@/lib/utils'

export interface FilterCheckProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  label: React.ReactNode
  count?: number
  id?: string
}

export function FilterCheck({
  name,
  value,
  label,
  count,
  id,
  className,
  ...props
}: FilterCheckProps) {
  const autoId = useId()
  const inputId = id ?? `check-${autoId}`

  return (
    <label
      data-slot="filter-check"
      htmlFor={inputId}
      className={cn(
        'flex min-h-7 cursor-pointer items-center gap-2 text-sm',
        'pointer-coarse:min-h-11',
        'has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        name={name}
        value={value}
        className="size-(--icon) pointer-coarse:size-6 flex-none accent-primary outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        {...props}
      />
      <span className="grow min-w-0">{label}</span>
      {count === undefined ? null : (
        <span className="text-sm text-text-muted tabular-nums">{count}</span>
      )}
    </label>
  )
}
