import { createFileRoute } from '@tanstack/react-router'

import { ProductDetailsContainer } from '@/containers/client/catalogue/product-details-container'

export const Route = createFileRoute('/products/$productId')({
  component: ProductDetailsContainer,
})
