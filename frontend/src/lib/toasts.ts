import { useSyncExternalStore } from 'react'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: number
  text: string
  action?: ToastAction | undefined
}

const DURATION = 2800

let nextId = 1
let toasts: readonly Toast[] = []
const listeners = new Set<() => void>()
const timers = new Map<number, ReturnType<typeof setTimeout>>()

const emit = () => listeners.forEach((listener) => listener())

export function dismissToast(id: number): void {
  const timer = timers.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts = toasts.filter((toast) => toast.id !== id)
  emit()
}

export function showToast(text: string, action?: ToastAction, duration = DURATION): void {
  const id = nextId
  nextId += 1
  toasts = [...toasts, { id, text, action }]
  emit()
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id)
      dismissToast(id)
    }, duration),
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
