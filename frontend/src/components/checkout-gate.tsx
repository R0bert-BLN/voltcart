import { Button } from '@/components/button'
import { Empty } from '@/components/empty'

export interface CheckoutGateProps {
  /** True when the cart has no lines. */
  empty: boolean
  /** Why the cart cannot go to checkout, or null when it can. */
  blocker: string | null
}

/** Empty state when the cart cannot go to checkout
    (MK.ui.checkoutGate): an empty cart or a blocker each render an Empty
    state with a way back, the checkout content follows the gate. */
export function CheckoutGate({ empty, blocker }: CheckoutGateProps) {
  if (empty) {
    return (
      <Empty icon="ShoppingCart" title="Your cart is empty" text="Add a product to start your order.">
        <Button label="Browse all products" href="/" />
      </Empty>
    )
  }

  if (blocker) {
    return (
      <Empty icon="TriangleExclamationPoint" title="Your cart needs a change" text={blocker}>
        <Button label="Back to cart" href="/" />
      </Empty>
    )
  }

  return null
}
