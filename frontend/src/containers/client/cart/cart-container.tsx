import { useMemo } from 'react'

import { isSignedIn } from '@/api/client'
import type { CartLineData } from '@/api/generated/types'
import { useCart, useRemoveCartLine, useUpdateCartLine } from '@/api/queries/client/cart'
import { useDeliveryMethods, useFilteredProducts } from '@/api/queries/common/catalogue'
import { useAddToWishlist } from '@/api/queries/client/wishlist'
import { CartView, type CartRow } from '@/components/views/client/cart-view'
import { CartLoadingState, EmptyCartState } from '@/components/views/common/states'
import { focusAfterRemoval, removeButtonSelector } from '@/lib/focus'
import { showToast } from '@/lib/toasts'

export function CartContainer() {
  const cart = useCart()
  const removeLine = useRemoveCartLine()
  const updateLine = useUpdateCartLine()
  const addToWishlist = useAddToWishlist()
  const deliveryMethods = useDeliveryMethods()
  const catalogue = useFilteredProducts({})

  const productInfo = useMemo(
    () =>
      new Map(
        catalogue.map((product) => [
          product.id,
          { stock: product.stock, categoryId: product.categoryId },
        ]),
      ),
    [catalogue],
  )

  if (!isSignedIn()) return <EmptyCartState />
  if (cart.isPending) return <CartLoadingState />

  const lines = cart.data?.lines ?? []

  const rows: CartRow[] = lines.map((line) => {
    const info = productInfo.get(line.productId)
    return { line, stock: info?.stock ?? line.quantity, categoryId: info?.categoryId ?? null }
  })

  const removeFromCart = (line: CartLineData, message: string) => {
    const removedIndex = lines.findIndex((candidate) => candidate.productId === line.productId)
    const remainingIds = lines
      .filter((candidate) => candidate.productId !== line.productId)
      .map((candidate) => candidate.productId)

    removeLine.mutate(line.productId, {
      onSuccess: () => {
        showToast(message)
        focusAfterRemoval(remainingIds, removedIndex, removeButtonSelector)
      },
    })
  }

  const moveToWishlist = (line: CartLineData) => {
    addToWishlist.mutate(line.productId)
    removeFromCart(line, `${line.name} moved to your wish list.`)
  }

  return (
    <CartView
      rows={rows}
      subtotalCents={cart.data?.subtotalCents ?? 0}
      estimatedDeliveryCents={
        deliveryMethods.find((method) => method.priceCents > 0)?.priceCents ?? null
      }
      onQuantityChange={(line, quantity) =>
        updateLine.mutate({ productId: line.productId, quantity })
      }
      onRemove={(line) => removeFromCart(line, `${line.name} removed from your cart.`)}
      onMoveToWishlist={moveToWishlist}
    />
  )
}
