import type { OrderStatus } from '@/api/generated/types'
import { isOrderStatus } from '@/lib/client/order-status'

export interface OrdersSearch {
  status?: OrderStatus
}

export const parseOrdersSearch = (search: Record<string, unknown>): OrdersSearch =>
  isOrderStatus(search.status) ? { status: search.status } : {}
