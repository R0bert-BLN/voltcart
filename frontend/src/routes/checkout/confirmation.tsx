import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** checkout-confirmation: order confirmed. */
export const Route = createFileRoute('/checkout/confirmation')({
  component: () => (
    <PlaceholderScreen
      title="Order confirmed"
      text="The confirmation with its order summary arrives with the checkout tickets."
    />
  ),
})
