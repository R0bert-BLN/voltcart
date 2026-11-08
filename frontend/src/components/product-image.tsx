import type { ProductData } from '@/api/generated/types'
import { cn } from 'cn'

/** One line-drawn device silhouette per category id (the seeders' slugs);
    an unknown category falls back to the accessories silhouette. */
const SILHOUETTES: Record<string, string> = {
  laptops:
    '<rect x="28" y="16" width="64" height="44" rx="3"/><path d="M16 68h88l-6 6H22z"/><path d="M28 60h64"/>',
  phones:
    '<rect x="42" y="8" width="36" height="72" rx="6"/><path d="M54 14h12"/><path d="M56 73h8"/>',
  audio:
    '<path d="M26 56V44a34 34 0 0 1 68 0v12"/><rect x="18" y="52" width="14" height="24" rx="5"/><rect x="88" y="52" width="14" height="24" rx="5"/>',
  monitors:
    '<rect x="14" y="12" width="92" height="52" rx="3"/><path d="M60 64v12"/><path d="M42 78h36"/>',
  'smart-home':
    '<rect x="40" y="18" width="40" height="60" rx="14"/><path d="M50 32h20"/><circle cx="60" cy="56" r="10"/><circle cx="60" cy="56" r="3"/>',
  accessories:
    '<rect x="20" y="26" width="30" height="38" rx="5"/><path d="M29 26V14M41 26V14"/><path d="M50 46h14a12 12 0 0 1 12 12v8a10 10 0 0 0 10 10h16"/>',
}

const sizes = {
  sm: 'size-(--thumb-sm) shrink-0 [&_svg]:w-[62%] [&_svg]:[stroke-width:1.5px]',
  md: 'w-full h-(--thumb-md) [&_svg]:w-[62%] [&_svg]:[stroke-width:2px]',
  lg: 'w-full h-(--thumb-lg) rounded-[var(--radius-lg)] [&_svg]:w-1/2 [&_svg]:[stroke-width:2.5px]',
} as const

export interface ProductImageSize {
  /** Side of the silhouette: a table thumbnail, a card image or a detail hero. */
  size?: keyof typeof sizes
}

/** Category silhouette from the mockup (MK.ui.productImage → .product-image):
    one line-drawn device per category on a soft primary tile. */
export function ProductImage({
  product,
  size = 'md',
  className,
}: {
  product: Pick<ProductData, 'name' | 'categoryId'>
  className?: string
} & ProductImageSize) {
  return (
    <div
      data-slot="product-image"
      role="img"
      aria-label={product.name}
      className={cn(
        'grid place-items-center bg-primary-soft text-primary rounded-[var(--radius-md)]',
        sizes[size],
        className,
      )}
    >
      <svg
        viewBox="0 0 120 90"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ height: 'auto' }}
        dangerouslySetInnerHTML={{ __html: SILHOUETTES[product.categoryId ?? ''] ?? SILHOUETTES.accessories }}
      />
    </div>
  )
}
