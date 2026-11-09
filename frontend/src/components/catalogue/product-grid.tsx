import type { ProductData } from '@/api/generated/types'
import { ProductCard } from '@/components/catalogue/product-card'
import { cn } from 'cn'

export interface ProductGridProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  products: ProductData[]
  /** Ids on the wish list, forwarded to each card as its toggle state. */
  wishedIds?: readonly string[]
  onWish?: (product: ProductData) => void
  onAdd?: (product: ProductData) => void
}

/** Product grid from the mockup (MK.ui.productGrid → .product-grid): an
    auto-fill grid of productCard(). */
export function ProductGrid({
  products,
  wishedIds = [],
  onWish,
  onAdd,
  className,
  ...props
}: ProductGridProps) {
  const wished = new Set(wishedIds)

  return (
    <div
      data-slot="product-grid"
      className={cn(
        'grid grid-cols-[repeat(auto-fill,minmax(var(--card-min),1fr))] gap-5',
        className,
      )}
      {...props}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          wished={wished.has(product.id)}
          onWish={onWish ? () => onWish(product) : undefined}
          onAdd={onAdd}
        />
      ))}
    </div>
  )
}
