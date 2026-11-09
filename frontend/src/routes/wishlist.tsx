import type { WishlistItemData } from '@/api/generated/types'
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'

import { getToken } from '@/api/client'
import { useAddToCart, useCart } from '@/api/queries/cart'
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/api/queries/wishlist'
import { AddToCart } from '@/components/cart/add-to-cart'
import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { PageHead } from '@/components/common/page-head'
import { ProductCell } from '@/components/catalogue/product-cell'
import { StockBadge } from '@/components/catalogue/stock-badge'
import { Table } from '@/components/common/table'
import { formatPrice } from '@/lib/format'
import { showToast } from '@/lib/toasts'

/** wishlist: the client's wish list, with per-product add to cart and a
    removable row whose Undo puts the product back (mockup screen wishlist).
    Adding to the cart never touches the wish list itself. */
export const Route = createFileRoute('/wishlist')({
  component: WishlistScreen,
})

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** The remove-undo toast stays long enough for a considered click. */
const UNDO_MS = 6000

/** The small action buttons of a row, as in the mockup's row-actions. */
const rowAction = 'px-(--sp-3) text-(--fs-sm) min-h-(--control-sm)'

/** The shared product components read the generated product fields; the wish
    list row keeps its own under productId. */
const rowProduct = (item: WishlistItemData) => ({ ...item, id: item.productId })

const emptyState = (
  <Empty
    icon="Heart"
    title="Your wish list is empty"
    text="Save a product with its heart button and it appears here."
    action={<Button label="Browse all products" href="/products" />}
  />
)

function WishlistScreen() {
  const cart = useCart()
  const wishlist = useWishlist()
  const addToCart = useAddToCart()
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  /** One Remove button per row; after a remove, focus moves to the next
      row's Remove, or to the empty state's link when the last one goes. */
  const removeRefs = useRef(new Map<string, HTMLButtonElement>())

  // A guest has no wish list query; the screen reads as an empty one.
  const signedIn = getToken() !== null

  /** Quantity of the product already in the cart, as the cart query sees it. */
  const held = (productId: string) =>
    cart.data?.lines.find((line) => line.productId === productId)?.quantity ?? 0

  /** One PUT with the line's next quantity; the backend caps it at the stock,
      so a capped write (the cart already held every unit) reports false. */
  const addOne = async (productId: string): Promise<boolean> => {
    const before = held(productId)
    const result = await addToCart.mutateAsync(productId)
    return result.now > before
  }

  const addToCartFromRow = (item: WishlistItemData) => {
    void addOne(item.productId).then((added) =>
      showToast(added ? 'Added to your cart.' : 'No more units are available.'),
    )
  }

  /** Adds one unit of every in-stock product, in list order (mockup
      data-add-all); a product whose units are all in the cart adds nothing. */
  const addAll = async () => {
    let added = 0
    for (const item of items) {
      if (item.stock > 0 && (await addOne(item.productId))) added += 1
    }
    showToast(
      added > 0 ? `${plural(added, 'item')} added to your cart.` : 'No more units are available.',
    )
  }

  /** The row leaves at once (the mutation updates the cache before the
      request answers); Undo puts the product back and focus returns to it. */
  const removeItem = (item: WishlistItemData) => {
    const removedIndex = items.findIndex((candidate) => candidate.productId === item.productId)
    removeFromWishlist.mutate(item.productId)
    showToast(
      `${item.name} removed.`,
      { label: 'Undo', onClick: () => putBack(item.productId) },
      UNDO_MS,
    )
    // The row's node is replaced on the next paint; focus once it has landed.
    requestAnimationFrame(() => focusAfterRemove(removedIndex, item.productId))
  }

  const focusAfterRemove = (removedIndex: number, removedId: string) => {
    const remaining = items.filter((item) => item.productId !== removedId)
    if (remaining.length === 0) {
      document.querySelector<HTMLElement>('[data-slot="empty"] a')?.focus()
      return
    }
    // Focus stays in the list: the row that took the removed row's place.
    const next = remaining[Math.min(removedIndex, remaining.length - 1)]
    removeRefs.current.get(next.productId)?.focus()
  }

  /** Undo of a remove: the PUT restores the stored added_at, so the refetch
      puts the row back where it was and focus follows it. */
  const putBack = (productId: string) => {
    addToWishlist.mutate(productId, {
      onSuccess: () => requestAnimationFrame(() => removeRefs.current.get(productId)?.focus()),
    })
  }

  // The wish list is loading: nothing to lay out until it answers.
  if (signedIn && wishlist.isPending) {
    return (
      <Empty
        icon="Clock"
        title="Loading your wish list"
        text="One moment — the saved products are on their way."
      />
    )
  }

  const items = wishlist.data ?? []

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead
        title="Wish list"
        subtitle={plural(items.length, 'item')}
        actions={
          items.length > 0 ? (
            <Button
              label="Add all available to cart"
              icon="ShoppingCart"
              // Nothing to add when the wish list holds only out-of-stock products.
              disabled={!items.some((item) => item.stock > 0)}
              onClick={() => void addAll()}
            />
          ) : undefined
        }
      />
      <section aria-label="Wish list">
        {items.length === 0 ? (
          emptyState
        ) : (
          <Table
            columns={[
              { label: 'Product' },
              { label: 'Price', num: true },
              { label: 'Availability' },
              { label: 'Actions', num: true },
            ]}
            rows={items.map((item) => ({
              cells: [
                <ProductCell
                  key="product"
                  product={rowProduct(item)}
                  href={`/products/${item.productId}`}
                  sub={<span className="text-text-muted">{item.categoryName}</span>}
                />,
                formatPrice(item.priceCents),
                <StockBadge key="stock" product={item} />,
                <div key="actions" className="flex justify-end gap-(--sp-2)">
                  <AddToCart
                    product={item}
                    variant="secondary"
                    className={rowAction}
                    onClick={() => addToCartFromRow(item)}
                  />
                  <Button
                    ref={(node) => {
                      if (node) removeRefs.current.set(item.productId, node)
                      else removeRefs.current.delete(item.productId)
                    }}
                    label="Remove"
                    variant="ghost"
                    className={rowAction}
                    aria-label={`Remove ${item.name} from the wish list`}
                    onClick={() => removeItem(item)}
                  />
                </div>,
              ],
            }))}
          />
        )}
      </section>
    </div>
  )
}
