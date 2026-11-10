import type { OrderSummaryData } from '@/api/generated/types'
import { Chips, type ChipItem } from '@/components/client/chips'
import { Empty } from '@/components/common/empty'
import { OrderStatusBadge } from '@/components/client/order-status'
import { PageHead } from '@/components/common/page-head'
import { Table } from '@/components/common/table'
import { formatPrice, formatTimestamp, plural } from '@/lib/format'

export interface OrderHistoryViewProps {
  orderCount: number
  shown: OrderSummaryData[]
  filters: ChipItem[]
  selectedFilter: string
  onFilterChange: (value: string) => void
}

const COLUMNS = [
  { label: 'Order' },
  { label: 'Date' },
  { label: 'Items', num: true },
  { label: 'Total', num: true },
  { label: 'Status', num: true },
]

export function OrderHistoryView({
  orderCount,
  shown,
  filters,
  selectedFilter,
  onFilterChange,
}: OrderHistoryViewProps) {
  const rows = shown.map((order) => [
    order.id,
    formatTimestamp(order.createdAt),
    order.itemCount,
    formatPrice(order.totalCents),
    <OrderStatusBadge key="status" status={order.status} />,
  ])

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead title="Order history" subtitle={plural(orderCount, 'order')} />
      <Chips
        items={filters}
        selected={selectedFilter}
        label="Filter by status"
        onChipChange={onFilterChange}
      />
      <section aria-label="Order history">
        {shown.length === 0 ? (
          <Empty
            icon="Receipt"
            title={`No ${selectedFilter} orders`}
            text="Choose another status to see your other orders."
          />
        ) : (
          <Table columns={COLUMNS} rows={rows} />
        )}
      </section>
    </div>
  )
}
