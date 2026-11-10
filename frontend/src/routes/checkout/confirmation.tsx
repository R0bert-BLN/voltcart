import { createFileRoute } from '@tanstack/react-router'

import {
  CheckoutConfirmationContainer,
} from '@/containers/client/checkout/checkout-confirmation-container'
import { optionalString } from '@/lib/search-params'
import { requireSignedIn } from '@/lib/client/guards'

export const Route = createFileRoute('/checkout/confirmation')({
  validateSearch: (search: Record<string, unknown>): { id?: string } => {
    const id = optionalString(search.id)
    return id ? { id } : {}
  },
  beforeLoad: ({ search }) =>
    requireSignedIn(
      search.id !== undefined ? `/checkout/confirmation?id=${search.id}` : '/checkout/confirmation',
    ),
  component: CheckoutConfirmationContainer,
})
