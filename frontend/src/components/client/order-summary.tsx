import type { OrderItemData } from '@/api/generated/types'
import { Totals } from '@/components/client/totals'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export type SummaryItem = Pick<OrderItemData, 'productId' | 'name' | 'quantity' | 'lineTotalCents'>

export interface OrderSummaryProps {
  items: SummaryItem[]
  delivery?: number | null
  deliveryLabel?: string
  className?: string
}

export function OrderSummary({
  items,
  delivery = null,
  deliveryLabel = 'Delivery',
  className,
}: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotalCents, 0)

  return (
    <Card className={cn('gap-3', className)}>
      <h2 className="text-(--fs-xl) font-(--fw-semibold) leading-(--lh-tight)">Order summary</h2>
      <ul className="flex flex-col gap-2 border-b border-border pb-3 text-sm">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-3">
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
