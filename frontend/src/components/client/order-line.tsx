import type { OrderItemData } from '@/api/generated/types'
import { ListRow } from '@/components/common/list'
import { ProductImage } from '@/components/common/product-image'
import { formatPrice } from '@/lib/format'

export interface OrderLineProps {
  item: OrderItemData
  link?: boolean
  className?: string
}

export function OrderLine({ item, link = false, className }: OrderLineProps) {
  return (
    <ListRow
      title={item.name}
      subtitle={`${item.quantity} × ${formatPrice(item.unitPriceCents)}`}
      lead={<ProductImage product={{ name: item.name, categoryId: null }} size="sm" />}
      trail={<span className="tabular-nums">{formatPrice(item.lineTotalCents)}</span>}
      href={link ? `/products/${item.productId}` : undefined}
      className={className}
    />
  )
}
