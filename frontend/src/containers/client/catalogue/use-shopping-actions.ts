import { useLocation, useNavigate } from '@tanstack/react-router'

import { isSignedIn } from '@/api/client'
import { useAddToCart } from '@/api/queries/client/cart'
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/api/queries/client/wishlist'
import { useMe } from '@/api/queries/common/auth'
import { showToast } from '@/lib/toasts'

const UNDO_DURATION_MS = 6000
const ACCOUNT_TOAST_DURATION_MS = 6000
const NO_UNITS_LEFT = 'No more units are available.'

export interface ShoppingActions {
  wishedIds: string[]
  addToCart: (productId: string, units?: number) => Promise<void>
  toggleWish: (productId: string) => void
}

export function useShoppingActions(): ShoppingActions {
  const navigate = useNavigate()
  const location = useLocation()
  const me = useMe()
  const wishlist = useWishlist()
  const addToCartMutation = useAddToCart()
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  const wishedIds = (wishlist.data ?? []).map((item) => item.productId)

  const requireAccount = (action: string): boolean => {
    if (isSignedIn()) {
      if (me.data?.role !== 'admin') return true
      showToast('Admin accounts cannot shop. Sign in with a customer account.')
      return false
    }
    showToast(
      `An account is required to ${action}.`,
      {
        label: 'Sign in',
        onClick: () => void navigate({ to: '/login', search: { next: location.href } }),
      },
      ACCOUNT_TOAST_DURATION_MS,
    )
    return false
  }

  const addToCart = async (productId: string, units = 1): Promise<void> => {
    if (!requireAccount('add items to your cart')) return

    let added = 0
    try {
      for (let unit = 0; unit < units; unit += 1) {
        const { held, now } = await addToCartMutation.mutateAsync(productId)
        if (now <= held) break
        added += 1
      }
    } catch {
      showToast('Could not add to your cart. Try again.')
      return
    }

    showToast(added > 0 ? 'Added to your cart.' : NO_UNITS_LEFT)
  }

  const toggleWish = (productId: string): void => {
    if (!requireAccount('use your wish list')) return

    if (wishedIds.includes(productId)) {
      removeFromWishlist.mutate(productId)
      showToast(
        'Removed from your wish list.',
        { label: 'Undo', onClick: () => addToWishlist.mutate(productId) },
        UNDO_DURATION_MS,
      )
      return
    }

    addToWishlist.mutate(productId, {
      onSuccess: () => showToast('Added to your wish list.'),
    })
  }

  return { wishedIds, addToCart, toggleWish }
}
