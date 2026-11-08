import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiRequest, getToken } from '@/api/client'
import type { OrderData, OrderSummaryData, PlaceOrderData } from '@/api/generated/types'

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
