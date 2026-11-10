import { createFileRoute } from '@tanstack/react-router'

import { OrderHistoryContainer } from '@/containers/client/orders/order-history-container'
import { parseOrdersSearch } from '@/containers/client/orders/orders-search'
import { requireSignedIn } from '@/lib/client/guards'

export const Route = createFileRoute('/orders/')({
  validateSearch: parseOrdersSearch,
  beforeLoad: () => requireSignedIn('/orders'),
  component: OrderHistoryContainer,
})
