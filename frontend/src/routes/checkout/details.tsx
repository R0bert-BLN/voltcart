import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** checkout-details: delivery and payment. */
export const Route = createFileRoute('/checkout/details')({
  component: () => (
    <PlaceholderScreen
      title="Delivery and payment"
      text="Delivery method, address and payment arrive with the checkout tickets."
    />
  ),
})
