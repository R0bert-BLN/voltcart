import type { ProductData } from '@/api/generated/types'
import { Badge } from '@/components/ui/badge'
import type { IconName } from '@/components/ui/icon'

export interface StockBadgeProps {
  product: Pick<ProductData, 'stock'>
  /** Admin screens use the plain wording ("Low stock", no count). */
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

/** Catalog stock levels from the mockup (MK.catalog.stock): low stock is
    1 to 5 units; 0 units and below are out of stock. */
const stockLevel = (stock: number): StockLevel => {
  if (stock <= 0) {
    return { key: 'out', label: 'Out of stock', adminLabel: 'Out of stock', tone: 'danger', icon: 'CircleX' }
  }
  if (stock <= 5) {
    return { key: 'low', label: `Only ${stock} left`, adminLabel: 'Low stock', tone: 'warning', icon: 'TriangleExclamationPoint' }
  }
  return { key: 'in', label: 'In stock', adminLabel: 'In stock', tone: 'success', icon: 'CircleCheck' }
}

/** Stock status from the mockup (MK.ui.stockBadge → .badge): tone and icon
    come from the stock count, the wording depends on the screen. */
export function StockBadge({ product, admin = false, className }: StockBadgeProps) {
  const level = stockLevel(product.stock)

  return (
    <Badge tone={level.tone} icon={level.icon} data-stock={level.key} className={className}>
      {admin ? level.adminLabel : level.label}
    </Badge>
  )
}
