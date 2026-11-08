import { cn } from 'cn'

import { useToasts } from '@/lib/toasts'

/** Feedback overlay (mockup .toasts/.toast): fixed at the bottom right, one
    status live region so a screen reader announces a toast on arrival. */
export function Toaster({ className }: { className?: string }) {
  const toasts = useToasts()

  return (
    <div
      data-slot="toasts"
      role="status"
      aria-live="polite"
      className={cn(
        'fixed right-(--sp-6) bottom-(--sp-6) z-(--z-toast) flex flex-col gap-(--sp-2)',
        className,
      )}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-slot="toast"
          className="max-w-(--dialog-w) rounded-[var(--radius-md)] bg-text p-(--sp-3) pr-(--sp-4) text-sm break-words text-surface shadow-md"
        >
          {toast.text}
        </div>
      ))}
    </div>
  )
}
