import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiRequest, getToken } from '@/api/client'
import type { CartData, OrderData, OrderSummaryData, PlaceOrderData } from '@/api/generated/types'

/** Places one order (mockup MK.orders.place): POST /checkout builds it from
    the cart in the backend, which reduces the stock and empties the cart. */
export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlaceOrderData) =>
      apiRequest<OrderData>('/checkout', { method: 'POST', body: data }),
    // The cart is gone in the backend; the cached one leaves with the order.
    onSuccess: (order) => {
      queryClient.setQueryData(['cart'], { lines: [], subtotalCents: 0 })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      return order
    },
  })
}

/** The full order history of the signed-in client, GET /orders (the mockup's
    MK.orders.list); a guest does not run the query. */
export function useOrders() {
  return useQuery({
    queryKey: ['orders', 'list'],
    queryFn: (): Promise<OrderSummaryData[]> => apiRequest<OrderSummaryData[]>('/orders'),
    enabled: getToken() !== null,
    retry: false,
  })
}

/** One order of the signed-in client, fresh from GET /orders/{id}; without
    an id the query falls back to the latest order still processing (the
    mockup's fallback when the screen opens without one) and reads as null
    when the account has no such order. */
export function useOrder(id?: string) {
  return useQuery({
    queryKey: ['orders', id ?? null],
    queryFn: async (): Promise<OrderData | null> => {
      if (id !== undefined) return apiRequest<OrderData>(`/orders/${id}`)
      const orders = await apiRequest<OrderSummaryData[]>('/orders')
      const processing = orders.find((order) => order.status === 'processing')
      return processing === undefined
        ? null
        : apiRequest<OrderData>(`/orders/${processing.id}`)
    },
    enabled: getToken() !== null,
    retry: false,
    // A 401 only means "not signed in" and a 404 that the id names no order
    // of this account; both read as "no order", the screen shows its empty
    // state. Anything else is a real failure.
    throwOnError: (error) =>
      !(error instanceof ApiError && (error.status === 401 || error.status === 404)),
  })
}

/** What one buy-again pass added to the cart: the lines that went in and the
    ones the stock (or a missing product) turned away. */
export interface BuyAgainResult {
  added: number
  skipped: number
}

/** Buy again (mockup MK.orders.buyAgain): puts every item back at its ordered
    quantity on top of what the cart already holds. The backend caps each line
    at the stock, so a line the cart did not grow counts as skipped. */
export function useBuyAgain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (order: OrderData): Promise<BuyAgainResult> => {
      const cart = await apiRequest<CartData>('/cart')
      const held = new Map(cart.lines.map((line) => [line.productId, line.quantity]))

      let added = 0
      let skipped = 0

      // One line at a time: every PUT reads and writes the same stored cart.
      for (const item of order.items) {
        const before = held.get(item.productId) ?? 0
        try {
          const nextCart = await apiRequest<CartData>(`/cart/${item.productId}`, {
            method: 'PUT',
            body: { quantity: before + item.quantity },
          })
          const now =
            nextCart.lines.find((line) => line.productId === item.productId)?.quantity ?? 0
          if (now > before) {
            added += 1
          } else {
            skipped += 1
          }
          held.set(item.productId, now)
          queryClient.setQueryData(['cart'], nextCart)
        } catch {
          // A product the catalog lost no longer buys; the others still do.
          skipped += 1
        }
      }

      return { added, skipped }
    },
  })
}
