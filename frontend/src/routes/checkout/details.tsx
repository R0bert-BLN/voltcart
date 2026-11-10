import { createFileRoute } from '@tanstack/react-router'

import { CheckoutDetailsContainer } from '@/containers/client/checkout/checkout-details-container'
import { requireSignedIn } from '@/lib/client/guards'

export const Route = createFileRoute('/checkout/details')({
  beforeLoad: () => requireSignedIn('/checkout/details'),
  component: CheckoutDetailsContainer,
})
