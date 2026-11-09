import { cn } from 'cn'
import { formatPrice } from '@/lib/format'

export interface TotalsProps {
  /** Subtotal of the order in cents. */
  subtotal: number
  /** Delivery price in cents, 0 for free, or null while no method is chosen. */
  delivery?: number | null
  /** Total in cents; defaults to subtotal plus delivery when given. */
  total?: number
  /** Label of the delivery line. */
  deliveryLabel?: string
  /** Extra classes on the list. */
  className?: string
}

/** Money summary of an order from the mockup (MK.ui.totals → .totals):
    subtotal, delivery and a separated, emphasised total line. */
export function Totals({ subtotal, delivery = null, total, deliveryLabel = 'Delivery', className }: TotalsProps) {
  const lines = [
    <div key="subtotal">
      <dt>Subtotal</dt>
      <dd>{formatPrice(subtotal)}</dd>
    </div>,
    <div key="delivery">
      <dt>{deliveryLabel}</dt>
      <dd>{delivery === null ? 'Chosen at checkout' : delivery === 0 ? 'Free' : formatPrice(delivery)}</dd>
    </div>,
    <div key="total" className="border-t border-border pt-3 mt-2 text-lg font-semibold">
      <dt className="text-text">Total</dt>
      <dd>{formatPrice(total ?? subtotal + (delivery ?? 0))}</dd>
    </div>,
  ]

  return (
    <dl
      data-slot="totals"
      className={cn('flex flex-col gap-2 tabular-nums [&>div]:flex [&>div]:justify-between [&>div]:gap-4', className)}
    >
      {lines}
    </dl>
  )
}
