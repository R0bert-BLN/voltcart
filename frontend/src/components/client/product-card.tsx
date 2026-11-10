import type { ProductData } from '@/api/generated/types'
import { Link } from '@tanstack/react-router'
import { AddToCart } from '@/components/client/add-to-cart'
import { ProductImage } from '@/components/common/product-image'
import { StockBadge } from '@/components/common/stock-badge'
import { WishButton } from '@/components/client/wish-button'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface ProductCardProps extends React.ComponentProps<'article'> {
  product: ProductData
  wished?: boolean
  onWish?: () => void
  onAdd?: (product: ProductData) => void
}

export function ProductCard({
  product,
  wished = false,
  onWish,
  onAdd,
  className,
  ...props
}: ProductCardProps) {
  return (
    <article
      data-slot="product-card"
      className={cn(
        'relative flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-3 transition-colors',
        'hover:border-primary',
        className,
      )}
      {...props}
    >
      <ProductImage product={product} size="md" />
      <WishButton
        pressed={wished}
        onToggle={onWish}
        className="absolute top-4 right-4 bg-surface shadow-[var(--shadow-sm)]"
      />
      <div className="flex flex-1 flex-col gap-2 px-1 pb-1">
        <h3 className="text-(--fs-lg) font-(--fw-medium)">
          <Link
            to="/products/$productId"
            params={{ productId: product.id }}
            className="rounded-(--radius-sm) outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {product.name}
          </Link>
        </h3>
        {product.categoryName ? <p className="text-sm text-text-muted">{product.categoryName}</p> : null}
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-(--fs-lg) font-(--fw-semibold) tabular-nums">{formatPrice(product.priceCents)}</span>
            <StockBadge product={product} />
          </div>
          <AddToCart product={product} variant="block secondary" onClick={() => onAdd?.(product)} />
        </div>
      </div>
    </article>
  )
}
