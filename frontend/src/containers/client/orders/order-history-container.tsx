import { getRouteApi, useNavigate } from '@tanstack/react-router'

import { useOrders } from '@/api/queries/client/orders'
import type { ChipItem } from '@/components/client/chips'
import { OrderHistoryView } from '@/containers/client/orders/order-history-view'
import {
  NoOrdersState,
  OrdersFailedState,
  OrdersLoadingState,
} from '@/containers/common/states'
import { isOrderStatus, ORDER_STATUSES, statusLabel } from '@/lib/client/order-status'

const route = getRouteApi('/orders/')

const ALL_FILTER = 'all'

const FILTERS: ChipItem[] = [
  { value: ALL_FILTER, label: 'All' },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: statusLabel(status) })),
]

export function OrderHistoryContainer() {
  const { status } = route.useSearch()
  const navigate = useNavigate({ from: route.id })
  const orders = useOrders()

  if (orders.isPending) return <OrdersLoadingState />
  if (orders.isError) return <OrdersFailedState />
  if (orders.data.length === 0) return <NoOrdersState />

  const history = orders.data
  const selectedFilter = status ?? ALL_FILTER

  return (
    <OrderHistoryView
      orderCount={history.length}
      shown={status ? history.filter((order) => order.status === status) : history}
      filters={FILTERS}
      selectedFilter={selectedFilter}
      onFilterChange={(value) =>
        void navigate({
          search: isOrderStatus(value) ? { status: value } : {},
          replace: true,
        })
      }
    />
  )
}
