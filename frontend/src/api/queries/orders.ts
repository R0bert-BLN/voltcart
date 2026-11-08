import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiRequest } from '@/api/client'
import type { OrderData, PlaceOrderData } from '@/api/generated/types'

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
