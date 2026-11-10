import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiRequest, isNotFound, isSignedIn, isUnauthorized } from '@/api/client'
import type { CartData, OrderData, OrderSummaryData, PlaceOrderData } from '@/api/generated/types'
import { queryKeys } from '@/api/queries/common/keys'

const EMPTY_CART: CartData = { lines: [], subtotalCents: 0 }

async function fetchLatestProcessingOrder(): Promise<OrderData | null> {
  const orders = await apiRequest<OrderSummaryData[]>('/orders')
  const processing = orders.find((order) => order.status === 'processing')
  return processing === undefined ? null : apiRequest<OrderData>(`/orders/${processing.id}`)
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlaceOrderData) =>
      apiRequest<OrderData>('/checkout', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.cart, EMPTY_CART)
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
    },
  })
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orderList,
    queryFn: () => apiRequest<OrderSummaryData[]>('/orders'),
    enabled: isSignedIn(),
    retry: false,
  })
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: (): Promise<OrderData | null> =>
      id === undefined ? fetchLatestProcessingOrder() : apiRequest<OrderData>(`/orders/${id}`),
    enabled: isSignedIn(),
    retry: false,
    throwOnError: (error) => !(isUnauthorized(error) || isNotFound(error)),
  })
}
