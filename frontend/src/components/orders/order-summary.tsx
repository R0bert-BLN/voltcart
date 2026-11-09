import type { OrderItemData } from '@/api/generated/types'
import { Totals } from '@/components/orders/totals'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import { cn } from 'cn'

export interface OrderSummaryProps {
  items: OrderItemData[]
  /** Delivery price in cents, 0 for free, or null while no method is chosen. */
  delivery?: number | null
  /** Label of the delivery line. */
  deliveryLabel?: string
  className?: string
}

/** Order summary from the mockup (MK.ui.orderSummary → .card): the items as
    name × quantity with their line total, then the money summary of the order. */
export function OrderSummary({ items, delivery = null, deliveryLabel = 'Delivery', className }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotalCents, 0)

  return (
    <Card className={cn('gap-3', className)}>
      <h2 className="text-(--fs-xl) font-(--fw-semibold) leading-(--lh-tight)">Order summary</h2>
      <ul className="flex flex-col gap-2 border-b border-border pb-3 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between gap-3">
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {item.name} × {item.quantity}
            </span>
            <span className="tabular-nums">{formatPrice(item.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      <Totals subtotal={subtotal} delivery={delivery} deliveryLabel={deliveryLabel} />
    </Card>
  )
}
