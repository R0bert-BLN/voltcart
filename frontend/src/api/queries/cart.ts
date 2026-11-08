import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiRequest, getToken } from '@/api/client'
import type { CartData } from '@/api/generated/types'

/** The signed-in client's cart; not fetched while the visitor is a guest. */
export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => apiRequest<CartData>('/cart'),
    enabled: getToken() !== null,
    retry: false,
    // A 401 only means "not signed in"; anything else is a real failure.
    throwOnError: (error) => !(error instanceof ApiError && error.status === 401),
  })
}

/** Sets one line's quantity (mockup MK.cart.setQty): the PUT writes the
    chosen value and the fresh cart replaces the cached one, so a write the
    backend capped at the stock shows up at once. */
export function useUpdateCartLine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      apiRequest<CartData>(`/cart/${productId}`, { method: 'PUT', body: { quantity } }),
    onSuccess: (cart) => queryClient.setQueryData(['cart'], cart),
  })
}

/** Removes one line from the cart (mockup MK.cart.remove): the row leaves at
    once, the refetch brings the cart back in line with the stored one. */
export function useRemoveCartLine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      apiRequest<void>(`/cart/${productId}`, { method: 'DELETE' }),
    onMutate: async (productId) => {
      const previous = queryClient.getQueryData<CartData>(['cart'])
      queryClient.setQueryData<CartData>(['cart'], (cart) =>
        cart
          ? {
              lines: cart.lines.filter((line) => line.productId !== productId),
              subtotalCents: cart.lines
                .filter((line) => line.productId !== productId)
                .reduce((sum, line) => sum + line.lineTotalCents, 0),
            }
          : cart,
      )
      return { previous }
    },
    // Nothing stuck: restore the cart as it was, so the UI misses nothing.
    onError: (_error, _productId, context) => {
      if (context?.previous) queryClient.setQueryData(['cart'], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })
}

/** One add-to-cart attempt: what the cart held before the PUT and the
    quantity the backend kept, so the screen can tell a capped write
    (stock or the 999 cap) apart from a real add. */
export interface AddToCartResult {
  productId: string
  held: number
  now: number
}

/** Adds one unit of a product to the cart (mockup MK.cart.add): the PUT sets
    the line's quantity to the held count plus one, and the stored quantity
    never exceeds the stock. */
export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<AddToCartResult> => {
      const cart = queryClient.getQueryData<CartData>(['cart'])
      const held = cart?.lines.find((line) => line.productId === productId)?.quantity ?? 0
      const nextCart = await apiRequest<CartData>(`/cart/${productId}`, {
        method: 'PUT',
        body: { quantity: held + 1 },
      })
      queryClient.setQueryData(['cart'], nextCart)

      return {
        productId,
        held,
        now: nextCart.lines.find((line) => line.productId === productId)?.quantity ?? 0,
      }
    },
  })
}
