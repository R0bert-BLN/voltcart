import { cn } from 'cn'

import { dismissToast, useToasts } from '@/lib/toasts'

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
          className="flex max-w-(--dialog-w) items-center justify-between gap-3 rounded-[var(--radius-md)] bg-text p-(--sp-3) pr-(--sp-4) text-sm break-words text-surface shadow-md"
        >
          {toast.text}
          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                dismissToast(toast.id)
                toast.action?.onClick()
              }}
              className="shrink-0 min-h-11 font-(--fw-semibold) text-surface underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {toast.action.label}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
