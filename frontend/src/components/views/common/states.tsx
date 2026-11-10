import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { LoadingState } from '@/components/common/loading-state'

const BrowseProductsButton = () => <Button label="Browse all products" href="/products" />

export const CartLoadingState = () => (
  <LoadingState title="Loading your cart" text="One moment — the lines are on their way." />
)

export const EmptyCartState = () => (
  <Empty
    icon="ShoppingCart"
    title="Your cart is empty"
    text="Add a product to start your order."
    action={<BrowseProductsButton />}
  />
)

export const WishlistLoadingState = () => (
  <LoadingState
    title="Loading your wish list"
    text="One moment — the saved products are on their way."
  />
)

export const EmptyWishlistState = () => (
  <Empty
    icon="Heart"
    title="Your wish list is empty"
    text="Save a product with its heart button and it appears here."
    action={<BrowseProductsButton />}
  />
)

export const OrdersLoadingState = () => (
  <LoadingState title="Loading your orders" text="One moment — the list is on its way." />
)

export const OrdersFailedState = () => (
  <Empty
    icon="TriangleExclamationPoint"
    title="Loading your orders failed"
    text="The list did not come through. Try again in a moment."
  />
)

export const NoOrdersState = () => (
  <Empty
    icon="Receipt"
    title="You have no orders yet"
    text="Your orders appear here once you place them."
    action={<BrowseProductsButton />}
  />
)

export const OrderLoadingState = () => (
  <LoadingState title="Loading your order" text="One moment — the order is on its way." />
)

export const OrderFailedState = () => (
  <Empty
    icon="TriangleExclamationPoint"
    title="Loading your order failed"
    text="The order did not come through. Try again in a moment."
  />
)

export const OrderNotFoundState = () => (
  <Empty
    icon="Receipt"
    title="This order could not be found"
    text="It may belong to another account."
    action={<Button label="Back to my orders" href="/orders" />}
  />
)

export const ConfirmationLoadingState = () => (
  <LoadingState title="Loading your order" text="One moment — the confirmation is on its way." />
)

export const NoOrderToConfirmState = () => (
  <Empty
    icon="Receipt"
    title="No order to show"
    text="Your confirmed orders appear in your order history."
    action={<Button label="Go to my orders" href="/orders" />}
  />
)

export const ProductNotFoundState = () => (
  <Empty
    icon="PackageX"
    title="Product not found"
    text="It may have been removed from the catalogue."
    action={<Button label="Browse all products" variant="secondary" href="/products" />}
  />
)

export const ProductGoneState = () => (
  <Empty
    icon="PackageX"
    title="This product no longer exists"
    text="It may have been deleted."
    action={<Button label="Back to products" href="/admin/products" />}
  />
)
