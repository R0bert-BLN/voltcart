import type { OrderStatus } from '@/api/generated/types'

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export const isOrderStatus = (value: unknown): value is OrderStatus =>
  ORDER_STATUSES.some((status) => status === value)

export const statusLabel = (status: string): string =>
  status.charAt(0).toUpperCase() + status.slice(1)
