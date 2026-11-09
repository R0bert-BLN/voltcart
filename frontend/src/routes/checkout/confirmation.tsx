import { createFileRoute, redirect } from '@tanstack/react-router'

import { getToken } from '@/api/client'
import { useMe } from '@/api/queries/auth'
import { useOrder } from '@/api/queries/orders'
import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { List } from '@/components/common/list'
import { OrderLine } from '@/components/orders/order-line'
import { SectionTitle } from '@/components/common/section-title'
import { Totals } from '@/components/orders/totals'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { formatTimestamp } from '@/lib/format'

/** checkout-confirmation: the order the Review order step placed (mockup
    screen checkout-confirmation). The id in the address is the one the review
    handed over with POST /checkout; the screen opens without one, it shows
    the latest order still processing. */

export const Route = createFileRoute('/checkout/confirmation')({
  validateSearch: (search: Record<string, unknown>) => {
    const id = typeof search.id === 'string' && search.id !== '' ? search.id : undefined
    return id ? { id } : {}
  },
  beforeLoad: ({ search }) => {
    // The order belongs to the account that placed it: a guest signs in first
    // and comes straight back here, the way the review step does.
    if (getToken() === null) {
      const next =
        search.id !== undefined ? `/checkout/confirmation?id=${search.id}` : '/checkout/confirmation'
      throw redirect({ to: '/login', search: { next } })
    }
  },
  component: CheckoutConfirmationScreen,
})

/** The mockup's state when no order is on its way (MK.ui.empty): nothing to
    confirm, and the way back to the order history. */
const noOrder = (
  <Empty
    icon="Receipt"
    title="No order to show"
    text="Your confirmed orders appear in your order history."
    action={<Button label="Go to my orders" href="/orders" />}
  />
)

function CheckoutConfirmationScreen() {
  const { id } = Route.useSearch()
  const orderQuery = useOrder(id)
  const me = useMe()

  if (orderQuery.isPending) {
    return (
      <Empty icon="Clock" title="Loading your order" text="One moment — the confirmation is on its way." />
    )
  }

  if (orderQuery.isError || orderQuery.data === null) return noOrder

  const order = orderQuery.data
  // The greeting takes the first name of the account that placed the order.
  const firstName = (me.data?.name ?? '').split(' ')[0]

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
          <Icon name="CircleCheck" className="size-7" />
        </span>
        <h1>Order confirmed</h1>
        <p className="text-sm text-text-muted">
          Thank you{firstName === '' ? '' : `, ${firstName}`}. Your order is being prepared.
        </p>
      </div>
      <Card className="gap-4 p-5">
        <dl className="grid gap-2 sm:grid-cols-2" aria-label="Confirmation details">
          <div>
            <dt className="text-sm text-text-muted">Order number</dt>
            <dd className="font-(--fw-semibold)">{order.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Estimated delivery</dt>
            <dd className="font-(--fw-semibold)">
              {order.estimatedAt === null ? 'To be confirmed' : formatTimestamp(order.estimatedAt)}
            </dd>
          </div>
        </dl>
      </Card>
      <section className="flex flex-col gap-3" aria-label="Order summary">
        <SectionTitle title="Order summary" />
        <List>
          {order.items.map((item) => (
            <OrderLine key={item.productId} item={item} link />
          ))}
        </List>
        <Card className="gap-4 p-5">
          <Totals subtotal={order.subtotalCents} delivery={order.deliveryCents} total={order.totalCents} />
        </Card>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button label="Continue shopping" variant="ghost" href="/products" />
        <Button label="View my orders" href="/orders" />
      </div>
    </div>
  )
}
