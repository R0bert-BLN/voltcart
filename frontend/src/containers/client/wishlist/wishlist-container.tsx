import { isSignedIn } from '@/api/client'
import type { WishlistItemData } from '@/api/generated/types'
import { useAddToCart } from '@/api/queries/client/cart'
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/api/queries/client/wishlist'
import { WishlistView } from '@/containers/client/wishlist/wishlist-view'
import { WishlistLoadingState } from '@/containers/common/states'
import { focusAfterPaint, focusAfterRemoval, removeButtonSelector } from '@/lib/focus'
import { plural } from '@/lib/format'
import { showToast } from '@/lib/toasts'

const UNDO_DURATION_MS = 6000
const NO_UNITS_LEFT = 'No more units are available.'

export function WishlistContainer() {
  const wishlist = useWishlist()
  const addToCart = useAddToCart()
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  if (isSignedIn() && wishlist.isPending) return <WishlistLoadingState />

  const items = wishlist.data ?? []

  const addOne = async (productId: string): Promise<boolean> => {
    const { held, now } = await addToCart.mutateAsync(productId)
    return now > held
  }

  const addToCartFromRow = (item: WishlistItemData) => {
    void addOne(item.productId).then((added) =>
      showToast(added ? 'Added to your cart.' : NO_UNITS_LEFT),
    )
  }

  const addAll = async () => {
    let added = 0
    for (const item of items) {
      if (item.stock > 0 && (await addOne(item.productId))) added += 1
    }
    showToast(added > 0 ? `${plural(added, 'item')} added to your cart.` : NO_UNITS_LEFT)
  }

  const putBack = (productId: string) => {
    addToWishlist.mutate(productId, {
      onSuccess: () => focusAfterPaint(removeButtonSelector(productId)),
    })
  }

  const removeItem = (item: WishlistItemData) => {
    const removedIndex = items.findIndex((candidate) => candidate.productId === item.productId)
    const remainingIds = items
      .filter((candidate) => candidate.productId !== item.productId)
      .map((candidate) => candidate.productId)

    removeFromWishlist.mutate(item.productId)
    showToast(
      `${item.name} removed.`,
      { label: 'Undo', onClick: () => putBack(item.productId) },
      UNDO_DURATION_MS,
    )
    focusAfterRemoval(remainingIds, removedIndex, removeButtonSelector)
  }

  return (
    <WishlistView
      items={items}
      canAddAll={items.some((item) => item.stock > 0)}
      onAddAll={() => void addAll()}
      onAddToCart={addToCartFromRow}
      onRemove={removeItem}
    />
  )
}
