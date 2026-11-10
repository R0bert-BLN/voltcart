import { createFileRoute } from '@tanstack/react-router'

import { WishlistContainer } from '@/containers/client/wishlist/wishlist-container'

export const Route = createFileRoute('/wishlist')({
  component: WishlistContainer,
})
