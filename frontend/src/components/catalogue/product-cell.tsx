import { Link, type LinkProps } from '@tanstack/react-router'

import { cn } from 'cn'
import { ProductImage } from '@/components/catalogue/product-image'
import type { ProductData } from '@/api/generated/types'

export interface ProductCellProps {
  product: Pick<ProductData, 'id' | 'name' | 'categoryId'>
  /** The product page; the name links here. Omit for a plain-text name. */
  href?: string
  /** Extra lines under the name, e.g. price, stock badge. */
  sub?: React.ReactNode
  className?: string
}

/** Table cell with a thumbnail, the name and an optional sub line from the
    mockup (MK.ui.productCell → .cell-product); with a href the name links. */
export function ProductCell({ product, href, sub, className }: ProductCellProps) {
  return (
    <div
      data-slot="cell-product"
      className={cn('flex min-w-0 items-center gap-3', className)}
    >
      <ProductImage product={product} size="sm" />
      <div className="flex min-w-0 flex-col items-start gap-1">
        {href ? (
          // The router link, so the name navigates within the app.
          <Link
            to={href as LinkProps['to']}
            className="font-medium text-text [overflow-wrap:anywhere] no-underline hover:text-primary hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {product.name}
          </Link>
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
