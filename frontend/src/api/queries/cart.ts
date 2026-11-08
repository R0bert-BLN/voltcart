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
