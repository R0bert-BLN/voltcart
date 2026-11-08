import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** wishlist: the account's wish list. */
export const Route = createFileRoute('/wishlist')({
  component: () => (
    <PlaceholderScreen
      title="Wish list"
      text="The wish list arrives with the wish list ticket."
    />
  ),
})
