import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiRequest, isForbidden, isSignedIn, isUnauthorized } from '@/api/client'
import type { CartData } from '@/api/generated/types'
import { queryKeys } from '@/api/queries/common/keys'

export interface AddToCartResult {
  productId: string
  held: number
  now: number
}

const quantityOf = (cart: CartData | undefined, productId: string): number =>
  cart?.lines.find((line) => line.productId === productId)?.quantity ?? 0

const withoutLine = (cart: CartData, productId: string): CartData => {
  const lines = cart.lines.filter((line) => line.productId !== productId)
  return { lines, subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0) }
}

const putQuantity = (productId: string, quantity: number) =>
  apiRequest<CartData>(`/cart/${productId}`, { method: 'PUT', body: { quantity } })

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => apiRequest<CartData>('/cart'),
    enabled: isSignedIn(),
    retry: false,
    throwOnError: (error) => !(isUnauthorized(error) || isForbidden(error)),
  })
}

export function useUpdateCartLine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      putQuantity(productId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  })
}

export function useRemoveCartLine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      apiRequest<void>(`/cart/${productId}`, { method: 'DELETE' }),
    onMutate: (productId) => {
      const previous = queryClient.getQueryData<CartData>(queryKeys.cart)
      queryClient.setQueryData<CartData>(queryKeys.cart, (cart) =>
        cart ? withoutLine(cart, productId) : cart,
      )
      return { previous }
    },
    onError: (_error, _productId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.cart, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<AddToCartResult> => {
      const held = quantityOf(queryClient.getQueryData<CartData>(queryKeys.cart), productId)
      const nextCart = await putQuantity(productId, held + 1)
      queryClient.setQueryData(queryKeys.cart, nextCart)

      return { productId, held, now: quantityOf(nextCart, productId) }
    },
  })
}
