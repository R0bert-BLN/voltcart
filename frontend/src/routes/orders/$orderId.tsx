import type { OrderData } from '@/api/generated/types'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

import { ApiError, getToken } from '@/api/client'
import { useBuyAgain, useOrder } from '@/api/queries/orders'
import { Breadcrumb } from '@/components/common/breadcrumb'
import { Button } from '@/components/common/button'
import { ContactBlock } from '@/components/orders/contact-block'
import { DeliveryBlock } from '@/components/orders/delivery-block'
import { Empty } from '@/components/common/empty'
import { List } from '@/components/common/list'
import { OrderLine } from '@/components/orders/order-line'
import { OrderStatusBadge } from '@/components/orders/order-status'
import { PageHead } from '@/components/common/page-head'
import { SectionTitle } from '@/components/common/section-title'
import { Timeline, type TimelineStep } from '@/components/orders/timeline'
import { Totals } from '@/components/orders/totals'
import { Card } from '@/components/ui/card'
import { formatTimestamp } from '@/lib/format'
import { showToast } from '@/lib/toasts'

/** orders-detail: a single order of the signed-in client (mockup screen
    orders-detail). The id in the address picks the order; the items, address,
    delivery and timeline all read from GET /orders/{id}. */

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: ({ params }) => {
    // The order belongs to the account that placed it: a guest signs in first
    // and comes straight back here, the way the order history does.
    if (getToken() === null) {
      throw redirect({ to: '/login', search: { next: `/orders/${params.orderId}` } })
    }
  },
  component: OrderDetailsScreen,
})

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** The mockup's MK.orders.timeline: the placed step is always done and the
    rest follows the status. The backend keeps no shipped or cancelled dates,
    so a done step reads as plain, a todo step names its estimate. A cancelled
    order stops at the cancellation. */
const timelineSteps = (order: OrderData): TimelineStep[] => {
  const placed: TimelineStep = {
    label: 'Order placed',
    text: formatTimestamp(order.createdAt),
    state: 'done',
  }
  if (order.status === 'cancelled') {
    return [placed, { label: 'Cancelled', state: 'stopped' }]
  }
  return [
    placed,
    order.status === 'processing'
      ? { label: 'Shipped', text: 'Not yet', state: 'todo' }
      : { label: 'Shipped', state: 'done' },
    order.status === 'delivered'
      ? { label: 'Delivered', state: 'done' }
      : {
          label: 'Delivered',
          text:
            order.estimatedAt === null
              ? 'Not yet'
              : `Estimated ${formatTimestamp(order.estimatedAt)}`,
          state: 'todo',
        },
  ]
}

/** The mockup's fallback when the id names no order of this account. */
const notFoundState = (
  <Empty
    icon="Receipt"
    title="This order could not be found"
    text="It may belong to another account."
    action={<Button label="Back to my orders" href="/orders" />}
  />
)

function OrderDetailsScreen() {
  const { orderId } = Route.useParams()
  const navigate = useNavigate()
  const orderQuery = useOrder(orderId)
  const buyAgain = useBuyAgain()

  if (orderQuery.isPending) {
    return <Empty icon="Clock" title="Loading your order" text="One moment — the order is on its way." />
  }

  // A 404 reads as "no order of this account"; anything else is a real failure.
  if (orderQuery.isError || orderQuery.data === null) {
    return orderQuery.error instanceof ApiError && orderQuery.error.status === 404 ? (
      notFoundState
    ) : (
      <Empty
        icon="TriangleExclamationPoint"
        title="Loading your order failed"
        text="The order did not come through. Try again in a moment."
      />
    )
  }

  const order = orderQuery.data
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  /** Buy again (mockup MK.orders.buyAgain): the in-stock items go back into
      the cart and the cart opens. */
  const handleBuyAgain = () => {
    if (buyAgain.isPending) return
    buyAgain.mutate(order, {
      onSuccess: ({ added, skipped }) => {
        if (added === 0) {
          showToast('None of these items can be added: they are out of stock or already all in your cart.')
          return
        }
        showToast(
          `${plural(added, 'product')} added to your cart.${
            skipped > 0 ? ` ${plural(skipped, 'item')} could not be added.` : ''
          }`,
        )
        void navigate({ to: '/cart' })
      },
      // The mutation counts each failed line as skipped, so this only fires
      // when the opening cart read itself failed.
      onError: () => {
        showToast('None of these items can be added: they are out of stock or already all in your cart.')
      },
    })
  }

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <Breadcrumb items={[{ label: 'My orders', href: '/orders' }, { label: order.id }]} />
      <PageHead
        title={`Order ${order.id}`}
        subtitle={`Placed ${formatTimestamp(order.createdAt)} · ${plural(itemCount, 'item')}`}
        actions={
          <Button label="Buy again" icon="RotateCcw" onClick={handleBuyAgain} disabled={buyAgain.isPending} />
        }
      />
      <div className="grid items-start gap-(--sp-6) lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-(--sp-6)">
          <section className="flex flex-col gap-3" aria-label="Items">
            <SectionTitle title="Items" />
            <List>
              {order.items.map((item) => (
                <OrderLine key={item.productId} item={item} link />
              ))}
            </List>
            <Card>
              <Totals
                subtotal={order.subtotalCents}
                delivery={order.deliveryCents}
                total={order.totalCents}
              />
            </Card>
          </section>
          <div className="grid items-start gap-(--sp-6) sm:grid-cols-2">
            <Card>
              <SectionTitle title="Delivery address" />
              <ContactBlock
                contact={{ name: order.contactName, phone: order.contactPhone }}
                address={{
                  line1: order.addressLine1,
                  city: order.city,
                  postcode: order.postalCode,
                  country: order.country,
                }}
              />
            </Card>
            <Card>
              <SectionTitle title="Delivery and payment" />
              <DeliveryBlock
                method={{ name: order.deliveryMethodName, days: order.deliveryMethodDays }}
                delivery={order.deliveryCents}
                payment={order.paymentMethod}
              />
            </Card>
          </div>
          {buyAgain.isError ? (
            <Empty
              icon="TriangleExclamationPoint"
              title="Buy again failed"
              text="The items could not be added to the cart. Try again in a moment."
            />
          ) : null}
        </div>
        <aside aria-label="Order status">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-(--fs-xl) font-(--fw-semibold) leading-(--lh-tight)">Status</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <Timeline steps={timelineSteps(order)} />
          </Card>
        </aside>
      </div>
    </div>
  )
}
