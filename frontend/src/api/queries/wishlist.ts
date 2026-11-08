import { useQuery } from '@tanstack/react-query'

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
