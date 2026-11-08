import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiRequest, getToken } from '@/api/client'
import type { WishlistItemData } from '@/api/generated/types'

/** The signed-in client's wish list; not fetched while the visitor is a guest. */
export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiRequest<WishlistItemData[]>('/wishlist'),
    enabled: getToken() !== null,
    retry: false,
    // A 401 only means "not signed in"; anything else is a real failure.
    throwOnError: (error) => !(error instanceof ApiError && error.status === 401),
  })
}

/** Puts a product back on the wish list, as the undo of a remove does; an
    already-listed product keeps its place (the stored added_at survives). */
export function useAddToWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      apiRequest<WishlistItemData>(`/wishlist/${productId}`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

/** Removes a product from the wish list straight away: the row disappears
    while the request runs, so Undo reads from the item the caller kept. */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      apiRequest<void>(`/wishlist/${productId}`, { method: 'DELETE' }),
    onMutate: async (productId: string) => {
      const previous = queryClient.getQueryData<WishlistItemData[]>(['wishlist']) ?? []
      queryClient.setQueryData<WishlistItemData[]>(['wishlist'], (items) =>
        items?.filter((item) => item.productId !== productId),
      )
      return { previous }
    },
    // Nothing stuck: restore the list as it was, so the UI misses nothing.
    onError: (_error, _productId, context) => {
      if (context?.previous) queryClient.setQueryData(['wishlist'], context.previous)
    },
  })
}