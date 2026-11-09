import type { OrderItemData } from '@/api/generated/types'
import { ListRow } from '@/components/common/list'
import { ProductImage } from '@/components/catalogue/product-image'
import { formatPrice } from '@/lib/format'

export interface OrderLineProps {
  item: OrderItemData
  /** Link the product name to its catalog page. */
  link?: boolean
  className?: string
}

/** One order item from the mockup (MK.ui.orderLine → .list-row): thumbnail,
    name, quantity × unit price and the line total; the name links to the
    product page when link is set. */
export function OrderLine({ item, link = false, className }: OrderLineProps) {
  return (
    <ListRow
      title={item.name}
      subtitle={`${item.quantity} × ${formatPrice(item.unitPriceCents)}`}
      lead={<ProductImage product={{ name: item.name, categoryId: null }} size="sm" />}
      trail={<span className="tabular-nums">{formatPrice(item.lineTotalCents)}</span>}
      href={link ? `/catalog/${item.productId}` : undefined}
      className={className}
    />
  )
}
