import type { OrderStatus } from '@/api/generated/types'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import type { IconName } from '@/components/ui/icon'

type StatusMeta = { label: string; tone: BadgeTone; icon: IconName }

/** Status wording, tone and icon per order status (the mockup's MK.orders.statusMeta). */
const statusMeta: Record<OrderStatus, StatusMeta> = {
  processing: { label: 'Processing', tone: '', icon: 'Clock' },
  shipped: { label: 'Shipped', tone: 'info', icon: 'Truck' },
  delivered: { label: 'Delivered', tone: 'success', icon: 'CircleCheck' },
  cancelled: { label: 'Cancelled', tone: 'danger', icon: 'CircleX' },
}

export interface OrderStatusBadgeProps {
  /** The order status; an unknown value renders as a neutral badge. */
  status: string
  className?: string
}

/** Order status from the mockup (MK.ui.orderStatus → .badge): the status label
    with its icon; the tone carries the state. */
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const meta = statusMeta[status as OrderStatus]

  return (
    <Badge tone={meta?.tone ?? ''} icon={meta?.icon} className={className}>
      {meta?.label ?? status}
    </Badge>
  )
}
