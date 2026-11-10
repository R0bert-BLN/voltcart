import type { WishlistItemData } from '@/api/generated/types'
import { AddToCart } from '@/components/client/add-to-cart'
import { Button } from '@/components/common/button'
import { PageHead } from '@/components/common/page-head'
import { ProductCell } from '@/components/common/product-cell'
import { StockBadge } from '@/components/common/stock-badge'
import { Table } from '@/components/common/table'
import { EmptyWishlistState } from '@/containers/common/states'
import { formatPrice, plural } from '@/lib/format'

export interface WishlistViewProps {
  items: WishlistItemData[]
  canAddAll: boolean
  onAddAll: () => void
  onAddToCart: (item: WishlistItemData) => void
  onRemove: (item: WishlistItemData) => void
}

const COLUMNS = [
  { label: 'Product' },
  { label: 'Price', num: true },
  { label: 'Availability' },
  { label: 'Actions', num: true },
]

export function WishlistView({ items, canAddAll, onAddAll, onAddToCart, onRemove }: WishlistViewProps) {
  const rows = items.map((item) => [
    <ProductCell
      key="product"
      product={{ id: item.productId, name: item.name, categoryId: item.categoryId }}
      href={`/products/${item.productId}`}
      sub={<span className="text-text-muted">{item.categoryName}</span>}
    />,
    formatPrice(item.priceCents),
    <StockBadge key="stock" product={item} />,
    <div key="actions" className="flex justify-end gap-(--sp-2)">
      <AddToCart
        product={item}
        variant="secondary"
        compact
        onClick={() => onAddToCart(item)}
      />
      <Button
        data-remove={item.productId}
        label="Remove"
        variant="ghost"
        compact
        aria-label={`Remove ${item.name} from the wish list`}
        onClick={() => onRemove(item)}
      />
    </div>,
  ])

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead
        title="Wish list"
        subtitle={plural(items.length, 'item')}
        actions={
          items.length > 0 ? (
            <Button
              label="Add all available to cart"
              icon="ShoppingCart"
              disabled={!canAddAll}
              onClick={onAddAll}
            />
          ) : undefined
        }
      />
      <section aria-label="Wish list">
        {items.length === 0 ? <EmptyWishlistState /> : <Table columns={COLUMNS} rows={rows} />}
      </section>
    </div>
  )
}
