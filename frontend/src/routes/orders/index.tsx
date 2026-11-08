import type { OrderSummaryData } from '@/api/generated/types'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

import { getToken } from '@/api/client'
import { useOrders } from '@/api/queries/orders'
import { Button } from '@/components/button'
import { Chips, type ChipItem } from '@/components/chips'
import { Empty } from '@/components/empty'
import { OrderStatusBadge } from '@/components/order-status'
import { PageHead } from '@/components/page-head'
import { Table } from '@/components/table'
import { formatPrice, formatTimestamp } from '@/lib/format'

/** orders-list: the order history of the signed-in client (mockup screen
    orders-list). A status filter chips across the one history; a filter
    choice lives in the address, so coming back from an order returns to it. */

export const Route = createFileRoute('/orders/')({
  validateSearch: (search: Record<string, unknown>) => {
    const status = typeof search.status === 'string' ? search.status : undefined
    return status !== undefined && isStatus(status) ? { status } : {}
  },
  beforeLoad: () => {
    // The order history belongs to the account: a guest signs in first and
    // comes straight back here.
    if (getToken() === null) {
      throw redirect({ to: '/login', search: { next: '/orders' } })
    }
  },
  component: OrderHistoryScreen,
})

const statuses = ['processing', 'shipped', 'delivered', 'cancelled']

const isStatus = (status: string): status is (typeof statuses)[number] =>
  statuses.includes(status)

const statusLabel = (status: string): string =>
  status.charAt(0).toUpperCase() + status.slice(1)

const ALL = { value: 'all', label: 'All' }

const filterItems: ChipItem[] = [
  ALL,
  ...statuses.map((status) => ({ value: status, label: statusLabel(status) })),
]

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** The small ghost button of a table row, as the wishlist row actions do. */
const rowAction = 'px-(--sp-3) text-(--fs-sm) min-h-(--control-sm)'

const emptyState = (
  <Empty
    icon="Receipt"
    title="You have no orders yet"
    text="Your orders appear here once you place them."
    action={<Button label="Browse all products" href="/products" />}
  />
)

/** The history under one status, or the mockup's filter empty state, which
    names the status since every filter has its own tin. */
const results = (status: string, orders: OrderSummaryData[]) => {
  const shown =
    status === ALL.value ? orders : orders.filter((order) => order.status === status)

  if (shown.length === 0) {
    return (
      <Empty
        icon="Receipt"
        title={`No ${status} orders`}
        text="Choose another status to see your other orders."
      />
    )
  }

  return (
    <Table
      columns={[
        { label: 'Order' },
        { label: 'Date' },
        { label: 'Items', num: true },
        { label: 'Total', num: true },
        { label: 'Status' },
        { label: 'Details' },
      ]}
      rows={shown.map((order) => ({
        'data-id': order.id,
        cells: [
          <Button
            key="number"
            label={order.id}
            variant="ghost"
            className={rowAction}
            href={`/orders/${order.id}`}
          />,
          formatTimestamp(order.createdAt),
          order.itemCount,
          formatPrice(order.totalCents),
          <OrderStatusBadge key="status" status={order.status} />,
          <div key="details" className="flex justify-end">
            <Button
              label="View details"
              variant="ghost"
              className={rowAction}
              aria-label={`View details of order ${order.id}`}
              href={`/orders/${order.id}`}
            />
          </div>,
        ],
      }))}
    />
  )
}

function OrderHistoryScreen() {
  const { status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const orders = useOrders()

  // The orders are loading: nothing to lay out until they answer.
  if (orders.isPending) {
    return (
      <Empty icon="Clock" title="Loading your orders" text="One moment — the list is on its way." />
    )
  }

  if (orders.isError) {
    return (
      <Empty
        icon="TriangleExclamationPoint"
        title="Loading your orders failed"
        text="The list did not come through. Try again in a moment."
      />
    )
  }

  const history = orders.data
  if (history.length === 0) return emptyState

  // An absent or unknown status in the address reads as the all filter.
  const chosen = status !== undefined && isStatus(status) ? status : ALL.value

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead title="Order history" subtitle={plural(history.length, 'order')} />
      <Chips
        items={filterItems}
        selected={chosen}
        label="Filter by status"
        onChipChange={(value) => {
          // Back from an order returns to the same filter.
          void navigate({
            search: value === ALL.value ? {} : { status: value },
            replace: true,
          })
        }}
      />
      <section aria-label="Order history">{results(chosen, history)}</section>
    </div>
  )
}
