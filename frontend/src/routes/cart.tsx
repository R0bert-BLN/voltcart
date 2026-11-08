import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** checkout-cart: the cart. */
export const Route = createFileRoute('/cart')({
  component: () => (
    <PlaceholderScreen title="Cart" text="The cart with its lines and totals arrives with the cart ticket." />
  ),
})
