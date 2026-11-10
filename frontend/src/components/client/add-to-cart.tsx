import type { ProductData } from '@/api/generated/types'
import { Button } from '@/components/common/button'

export interface AddToCartProps
  extends Omit<React.ComponentProps<typeof Button>, 'label' | 'children'> {
  product: Pick<ProductData, 'stock'>
  label?: string
}

export function AddToCart({
  product,
  label = 'Add to cart',
  variant = '',
  disabled,
  ...props
}: AddToCartProps) {
  const outOfStock = product.stock <= 0

  return (
    <Button
      label={outOfStock ? 'Out of stock' : label}
      icon={outOfStock ? undefined : 'ShoppingCart'}
      variant={variant}
      disabled={outOfStock || disabled}
      {...props}
    />
  )
}
