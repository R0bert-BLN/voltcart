import { createFileRoute } from '@tanstack/react-router'

import { CartContainer } from '@/containers/client/cart/cart-container'

export const Route = createFileRoute('/cart')({
  component: CartContainer,
})
