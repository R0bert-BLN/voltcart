import type { ProductData } from '@/api/generated/types'
import { Badge } from '@/components/ui/badge'
import type { IconName } from '@/components/ui/icon'

export interface StockBadgeProps {
  product: Pick<ProductData, 'stock'>
  admin?: boolean
  className?: string
}

type StockLevel = {
  key: 'out' | 'low' | 'in'
  label: string
  adminLabel: string
  tone: '' | 'success' | 'warning' | 'danger'
  icon: IconName
}

const stockLevel = (stock: number): StockLevel => {
  if (stock <= 0) {
    return { key: 'out', label: 'Out of stock', adminLabel: 'Out of stock', tone: 'danger', icon: 'CircleX' }
  }
  if (stock <= 5) {
    return { key: 'low', label: `Only ${stock} left`, adminLabel: 'Low stock', tone: 'warning', icon: 'TriangleExclamationPoint' }
  }
  return { key: 'in', label: 'In stock', adminLabel: 'In stock', tone: 'success', icon: 'CircleCheck' }
}

export function StockBadge({ product, admin = false, className }: StockBadgeProps) {
  const level = stockLevel(product.stock)

  return (
    <Badge tone={level.tone} icon={level.icon} data-stock={level.key} className={className}>
      {admin ? level.adminLabel : level.label}
    </Badge>
  )
}
