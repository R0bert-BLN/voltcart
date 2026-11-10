import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiRequest, isForbidden, isSignedIn, isUnauthorized } from '@/api/client'
import type { WishlistItemData } from '@/api/generated/types'
import { queryKeys } from '@/api/queries/common/keys'

export function useWishlist() {
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => apiRequest<WishlistItemData[]>('/wishlist'),
    enabled: isSignedIn(),
    retry: false,
    throwOnError: (error) => !(isUnauthorized(error) || isForbidden(error)),
  })
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      apiRequest<WishlistItemData>(`/wishlist/${productId}`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist }),
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      apiRequest<void>(`/wishlist/${productId}`, { method: 'DELETE' }),
    onMutate: (productId: string) => {
      const previous = queryClient.getQueryData<WishlistItemData[]>(queryKeys.wishlist) ?? []
      queryClient.setQueryData<WishlistItemData[]>(queryKeys.wishlist, (items) =>
        items?.filter((item) => item.productId !== productId),
      )
      return { previous }
    },
    onError: (_error, _productId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.wishlist, context.previous)
    },
  })
}
