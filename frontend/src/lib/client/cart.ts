import type { CartLineData, OrderItemData } from '@/api/generated/types'

export const toOrderItems = (lines: CartLineData[]): OrderItemData[] =>
  lines.map((line) => ({
    productId: line.productId,
    name: line.name,
    unitPriceCents: line.priceCents,
    quantity: line.quantity,
    lineTotalCents: line.lineTotalCents,
  }))
