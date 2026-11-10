import { useCallback, useEffect, useRef } from 'react'

export interface DebouncedCallback<Args extends unknown[]> {
  run: (...args: Args) => void
  cancel: () => void
}

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): DebouncedCallback<Args> {
  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => clearTimeout(timerRef.current), [])

  const run = useCallback(
    (...args: Args) => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => callbackRef.current(...args), delayMs)
    },
    [delayMs],
  )

  useEffect(() => cancel, [cancel])

  return { run, cancel }
}
