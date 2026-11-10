import { useEffect, useRef, useState } from 'react'

import { Field, type FieldProps } from '@/components/forms/field'
import { useDebouncedCallback } from '@/lib/use-debounced-callback'

export interface SearchFieldProps
  extends Omit<FieldProps, 'type' | 'value' | 'defaultValue' | 'onChange' | 'ref'> {
  value: string
  onSearch: (value: string) => void
  delayMs?: number
}

const DEFAULT_DELAY_MS = 350

export function SearchField({
  value,
  onSearch,
  delayMs = DEFAULT_DELAY_MS,
  onKeyDown,
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(value)
  const debounced = useDebouncedCallback(onSearch, delayMs)

  useEffect(() => {
    if (document.activeElement !== inputRef.current) setText(value)
  }, [value])

  return (
    <Field
      {...props}
      ref={inputRef}
      type="search"
      value={text}
      onChange={(event) => {
        setText(event.target.value)
        debounced.run(event.target.value.trim())
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key !== 'Enter') return
        event.preventDefault()
        debounced.cancel()
        onSearch(event.currentTarget.value.trim())
      }}
    />
  )
}
