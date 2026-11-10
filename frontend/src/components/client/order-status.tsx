import type { OrderStatus } from '@/api/generated/types'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import type { IconName } from '@/components/ui/icon'

type StatusMeta = { label: string; tone: BadgeTone; icon: IconName }

const statusMeta: Record<OrderStatus, StatusMeta> = {
  processing: { label: 'Processing', tone: '', icon: 'Clock' },
  shipped: { label: 'Shipped', tone: 'info', icon: 'Truck' },
  delivered: { label: 'Delivered', tone: 'success', icon: 'CircleCheck' },
  cancelled: { label: 'Cancelled', tone: 'danger', icon: 'CircleX' },
}

export interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const meta = statusMeta[status as OrderStatus]

  return (
    <Badge tone={meta?.tone ?? ''} icon={meta?.icon} className={className}>
      {meta?.label ?? status}
    </Badge>
  )
}
