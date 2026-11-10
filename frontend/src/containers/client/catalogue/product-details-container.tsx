import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

import { useProductDetails } from '@/api/queries/common/catalogue'
import { ProductDetailsView } from '@/components/views/client/product-details-view'
import { ProductNotFoundState } from '@/components/views/common/states'
import { useShoppingActions } from '@/containers/client/catalogue/use-shopping-actions'

const route = getRouteApi('/products/$productId')

export function ProductDetailsContainer() {
  const { productId } = route.useParams()
  const details = useProductDetails(productId)
  const [quantity, setQuantity] = useState(1)
  const { wishedIds, addToCart, toggleWish } = useShoppingActions()

  if (!details) return <ProductNotFoundState />

  return (
    <ProductDetailsView
      details={details}
      quantity={quantity}
      onQuantityChange={setQuantity}
      wished={wishedIds.includes(details.product.id)}
      onAdd={() => void addToCart(details.product.id, quantity)}
      onWish={() => toggleWish(details.product.id)}
    />
  )
}
