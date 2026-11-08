import { useSyncExternalStore } from 'react'

export interface Toast {
  id: number
  text: string
}

const DURATION = 2800

let nextId = 1
let toasts: readonly Toast[] = []
const listeners = new Set<() => void>()
const timers = new Map<number, ReturnType<typeof setTimeout>>()

const emit = () => listeners.forEach((listener) => listener())

/** Removes a toast now: the timeout below, or a caller that dismisses early. */
export function dismissToast(id: number): void {
  const timer = timers.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts = toasts.filter((toast) => toast.id !== id)
  emit()
}

/** Pops a short-lived toast over the app. The store lives outside the router,
    so the message survives the navigation that usually follows (mockup
    MK.toast / MK.flash). */
export function showToast(text: string): void {
  const id = nextId
  nextId += 1
  toasts = [...toasts, { id, text }]
  emit()
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id)
      dismissToast(id)
    }, DURATION),
  )
}

export function useToasts(): readonly Toast[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => toasts,
  )
}
