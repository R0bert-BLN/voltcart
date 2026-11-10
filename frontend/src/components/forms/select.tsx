import { useId } from 'react'

import { Icon } from '@/components/ui/icon'
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label: string
  options: Array<string | SelectOption>
  hint?: string
  error?: string
  placeholder?: string
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onValueChange?: (value: string) => void
}

const EMPTY_VALUE = '__empty__'

const toOption = (option: string | SelectOption): SelectOption =>
  typeof option === 'string' ? { value: option, label: option } : option

export function Select({
  label,
  options,
  hint,
  error,
  placeholder,
  className,
  id,
  value,
  defaultValue,
  onValueChange,
  ...props
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? `f-${autoId}`
  const hintId = `${selectId}-hint`
  const errorId = `${selectId}-error`

  const items = options.map(toOption)
  const hasEmptyOption = items.some((item) => item.value === '')
  const encode = (raw: string | undefined) => (hasEmptyOption && raw === '' ? EMPTY_VALUE : raw)
  const decode = (raw: string) => (raw === EMPTY_VALUE ? '' : raw)

  return (
    <div data-slot="select" className={cn('flex flex-col gap-1 text-sm', className)}>
      <label className="font-medium" htmlFor={selectId}>
        {label}
      </label>
      <SelectRoot
        value={encode(value)}
        defaultValue={encode(defaultValue)}
        onValueChange={onValueChange ? (next) => onValueChange(decode(next)) : undefined}
        {...props}
      >
        <SelectTrigger
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hint && hintId, error && errorId) || undefined}
          className={cn(
            'w-full min-w-40 rounded-(--radius-md) border-border-strong bg-surface px-3 text-base data-[size=default]:h-(--control) pointer-coarse:data-[size=default]:h-11',
            'hover:border-primary data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-ring/50',
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className="max-h-72 rounded-(--radius-md)">
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value === '' ? EMPTY_VALUE : item.value}
              className="py-2 pr-8 pl-2.5 pointer-coarse:py-3"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
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
