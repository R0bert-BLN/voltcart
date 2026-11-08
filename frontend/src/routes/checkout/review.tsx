import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** checkout-review: review order. */
export const Route = createFileRoute('/checkout/review')({
  component: () => (
    <PlaceholderScreen
      title="Review order"
      text="The order review with its summary arrives with the checkout tickets."
    />
  ),
})
