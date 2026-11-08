import { useQuery } from '@tanstack/react-query'

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
