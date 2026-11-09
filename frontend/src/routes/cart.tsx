import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

import { getToken } from '@/api/client'
import type { CartLineData } from '@/api/generated/types'
import { useCart, useRemoveCartLine, useUpdateCartLine } from '@/api/queries/cart'
import { useDeliveryMethods, useFilteredProducts } from '@/api/queries/catalogue'
import { useAddToWishlist } from '@/api/queries/wishlist'
import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { PageHead } from '@/components/common/page-head'
import { ProductCell } from '@/components/catalogue/product-cell'
import { StockBadge } from '@/components/catalogue/stock-badge'
import { Stepper } from '@/components/cart/stepper'
import { Table } from '@/components/common/table'
import { Totals } from '@/components/orders/totals'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { formatPrice } from '@/lib/format'
import { showToast } from '@/lib/toasts'

/** checkout-cart: the cart with its rows, quantity steppers and order
    summary (mockup screen checkout-cart). The cart stays open to guests: they
    cannot have lines, so the sign-in comes at Continue to checkout. */

export const Route = createFileRoute('/cart')({
  component: CartScreen,
})

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

const emptyCart = (
  <Empty
    icon="ShoppingCart"
    title="Your cart is empty"
    text="Add a product to start your order."
    action={<Button label="Browse all products" href="/products" />}
  />
)

/** The trash icon button of one row (mockup .icon-btn). */
const removeButtonClass =
  'grid size-(--control) place-items-center rounded-(--radius-md) text-(--text-muted) outline-none hover:bg-(--surface-2) hover:text-text focus-visible:ring-2 focus-visible:ring-(--focus)'

/** The cells of one cart row: product with stock status, unit price, quantity
    stepper, line total, Remove. A pure function, so the screen can build the
    rows of the shared Table in one map (mockup row()). */
const cartRowCells = (
  line: CartLineData,
  stock: number,
  categoryId: string | null,
  updateQuantity: (line: CartLineData, quantity: number) => void,
  onRemove: (line: CartLineData) => void,
  moveToWishList: (line: CartLineData) => void,
): React.ReactNode[] => [
  <ProductCell
    key="product"
    product={{ id: line.productId, name: line.name, categoryId }}
    href={`/products/${line.productId}`}
    sub={
      <>
        {stock <= 5 ? <StockBadge product={{ stock }} /> : null}
        <button
          type="button"
          onClick={() => moveToWishList(line)}
          className="text-sm text-(--text-muted) underline-offset-4 outline-none hover:text-text hover:underline focus-visible:underline"
        >
          Move to wish list
        </button>
      </>
    }
  />,
  <span key="unit-price" className="tabular-nums">
    {formatPrice(line.priceCents)}
  </span>,
  stock > 0 ? (
    <Stepper
      key="quantity"
      value={line.quantity}
      min={1}
      max={stock}
      label={`Quantity of ${line.name}`}
      onValueChange={(quantity) => updateQuantity(line, quantity)}
    />
  ) : (
    <span key="quantity" className="text-(--text-muted)">
      None available
    </span>
  ),
  <span key="line-total" data-line-total={line.productId} className="tabular-nums">
    {formatPrice(line.lineTotalCents)}
  </span>,
  <button
    key="remove"
    type="button"
    aria-label={`Remove ${line.name} from the cart`}
    className={removeButtonClass}
    onClick={() => onRemove(line)}
  >
    <Icon name="Trash" />
  </button>,
]

function CartScreen() {
  const cart = useCart()
  const removeLine = useRemoveCartLine()
  const updateLine = useUpdateCartLine()
  const addToWishlist = useAddToWishlist()
  const deliveryMethods = useDeliveryMethods()
  const catalogue = useFilteredProducts({})

  /** Stock and category for each line, from the catalogue the cart items
      were taken from; the cart line itself carries neither. */
  const stockById = useMemo(
    () =>
      new Map(
        catalogue.map((product) => [
          product.id,
          { stock: product.stock, categoryId: product.categoryId },
        ]),
      ),
    [catalogue],
  )

  // The cart query only runs while signed in; for a guest it reads as empty.
  const signedIn = getToken() !== null
  const lines = cart.data?.lines ?? []
  const subtotalCents = cart.data?.subtotalCents ?? 0
  const estimate = deliveryMethods.find((method) => method.price > 0)

  /** Removes the line, then keeps focus in the table: the next row's Remove
      button, or the empty state's link when the cart is now empty. */
  const removeFromCart = (line: CartLineData, moved = false) => {
    const removedIndex = lines.findIndex((candidate) => candidate.productId === line.productId)
    removeLine.mutate(line.productId, {
      onSuccess: () => {
        showToast(
          moved
            ? `${line.name} moved to your wish list.`
            : `${line.name} removed from your cart.`,
        )
        // The row is gone on the next paint; focus once it has landed.
        requestAnimationFrame(() => {
          const remaining = lines.filter((candidate) => candidate.productId !== line.productId)
          if (remaining.length === 0) {
            document.querySelector<HTMLElement>('[data-slot="empty"] a')?.focus()
            return
          }
          const next = remaining[Math.min(removedIndex, remaining.length - 1)].productId
          document
            .querySelector<HTMLElement>(`tr[data-line='${next}'] td:last-child button`)
            ?.focus()
        })
      },
    })
  }

  const moveToWishList = (line: CartLineData) => {
    addToWishlist.mutate(line.productId)
    removeFromCart(line, true)
  }

  // Guests read the empty cart: the lines live behind the sign-in.
  if (!signedIn) return emptyCart

  if (cart.isPending) {
    return (
      <Empty icon="Clock" title="Loading your cart" text="One moment — the lines are on their way." />
    )
  }

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead title="Your cart" subtitle={plural(lines.length, 'item')} />
      {lines.length === 0 ? (
        emptyCart
      ) : (
        <div className="grid items-start gap-(--sp-6) lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Table
            columns={[
              { label: 'Product' },
              { label: 'Unit price', num: true },
              { label: 'Quantity' },
              { label: 'Total', num: true },
              { label: 'Remove' },
            ]}
            rows={lines.map((line) => {
              const info = stockById.get(line.productId)
              return {
                'data-line': line.productId,
                cells: cartRowCells(
                  line,
                  info?.stock ?? line.quantity,
                  info?.categoryId ?? null,
                  (target, quantity) =>
                    updateLine.mutate({ productId: target.productId, quantity }),
                  (target) => removeFromCart(target),
                  (target) => moveToWishList(target),
                ),
              }
            })}
          />
          <aside aria-label="Order summary">
            <Card className="gap-4">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <Totals
                subtotal={subtotalCents}
                delivery={estimate ? Math.round(estimate.price * 100) : null}
                deliveryLabel="Estimated delivery"
              />
              <Button label="Continue to checkout" variant="block" href="/checkout/details" />
              <Button label="Continue shopping" variant="ghost block" href="/products" />
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}
