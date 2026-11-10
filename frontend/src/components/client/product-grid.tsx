import type { ProductData } from '@/api/generated/types'
import { ProductCard } from '@/components/client/product-card'
import { cn } from '@/lib/utils'

export interface ProductGridProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  products: ProductData[]
  wishedIds?: readonly string[]
  onWish?: (product: ProductData) => void
  onAdd?: (product: ProductData) => void
}

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
