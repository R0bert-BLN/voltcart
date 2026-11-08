import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** orders-detail: a single order. */
export const Route = createFileRoute('/orders/$orderId')({
  component: () => (
    <PlaceholderScreen
      title="Order details"
      text="A single order with its items and timeline arrives with the orders ticket."
    />
  ),
})
