import { formatDeliveryPrice, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface TotalsProps {
  subtotal: number
  delivery?: number | null
  total?: number
  deliveryLabel?: string
  className?: string
}

export function Totals({
  subtotal,
  delivery = null,
  total,
  deliveryLabel = 'Delivery',
  className,
}: TotalsProps) {
  return (
    <dl
      data-slot="totals"
      className={cn(
        'flex flex-col gap-2 tabular-nums [&>div]:flex [&>div]:justify-between [&>div]:gap-4',
        className,
      )}
    >
      <div>
        <dt>Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div>
        <dt>{deliveryLabel}</dt>
        <dd>{delivery === null ? 'Chosen at checkout' : formatDeliveryPrice(delivery)}</dd>
      </div>
      <div className="mt-2 border-t border-border pt-3 text-lg font-semibold">
        <dt className="text-text">Total</dt>
        <dd>{formatPrice(total ?? subtotal + (delivery ?? 0))}</dd>
      </div>
    </dl>
  )
}
