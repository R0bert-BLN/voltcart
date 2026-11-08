import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** orders-list: the order history. */
export const Route = createFileRoute('/orders/')({
  component: () => (
    <PlaceholderScreen
      title="Order history"
      text="The account's past orders arrive with the orders ticket."
    />
  ),
})
