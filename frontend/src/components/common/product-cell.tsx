import { cn } from '@/lib/utils'
import { AppLink } from '@/components/common/app-link'
import { ProductImage } from '@/components/common/product-image'
import type { ProductData } from '@/api/generated/types'

export interface ProductCellProps {
  product: Pick<ProductData, 'id' | 'name' | 'categoryId'>
  href?: string
  sub?: React.ReactNode
  className?: string
}

export function ProductCell({ product, href, sub, className }: ProductCellProps) {
  return (
    <div
      data-slot="cell-product"
      className={cn('flex min-w-0 items-center gap-3', className)}
    >
      <ProductImage product={product} size="sm" />
      <div className="flex min-w-0 flex-col items-start gap-1">
        {href ? (
          <AppLink
            href={href}
            className="font-medium text-text [overflow-wrap:anywhere] no-underline hover:text-primary hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {product.name}
          </AppLink>
        ) : (
          <span className="font-medium text-text [overflow-wrap:anywhere]">{product.name}</span>
        )}
        {sub ? (
          <div className="min-w-0 text-sm [overflow-wrap:anywhere]">{sub}</div>
        ) : null}
      </div>
    </div>
  )
}
