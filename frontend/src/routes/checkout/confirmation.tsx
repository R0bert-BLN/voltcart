import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** checkout-confirmation: order confirmed. The id in the address is the one
    the Review order step hands over after POST /checkout. */

export const Route = createFileRoute('/checkout/confirmation')({
  validateSearch: (search: Record<string, unknown>) => {
    const id = typeof search.id === 'string' ? search.id : undefined
    return id ? { id } : {}
  },
  component: () => (
    <PlaceholderScreen
      title="Order confirmed"
      text="The confirmation with its order summary arrives with the checkout tickets."
    />
  ),
})
