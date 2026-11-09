import type { ProductData } from '@/api/generated/types'
import { Button } from '@/components/common/button'

export interface AddToCartProps
  extends Omit<React.ComponentProps<typeof Button>, 'label' | 'children'> {
  /** The product; a stock of 0 or less disables the button. */
  product: Pick<ProductData, 'stock'>
  /** Label while the product is in stock; an out-of-stock button always
      reads "Out of stock" (mockup MK.ui.addToCart) with no cart icon. */
  label?: string
}

/** Add-to-cart from the mockup (MK.ui.addToCart → .btn): the shared Button
    with a cart icon, disabled when the product is out of stock. */
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
