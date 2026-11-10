import type { OrderData } from '@/api/generated/types'
import { Button } from '@/components/common/button'
import { List } from '@/components/common/list'
import { OrderLine } from '@/components/client/order-line'
import { SectionTitle } from '@/components/common/section-title'
import { Totals } from '@/components/client/totals'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { formatTimestamp } from '@/lib/format'

export interface CheckoutConfirmationViewProps {
  order: OrderData
  customerFirstName: string
}

export function CheckoutConfirmationView({ order, customerFirstName }: CheckoutConfirmationViewProps) {
  return (
    <div className="flex flex-col gap-(--sp-6)">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
          <Icon name="CircleCheck" className="size-7" />
        </span>
        <h1>Order confirmed</h1>
        <p className="text-sm text-text-muted">
          Thank you{customerFirstName === '' ? '' : `, ${customerFirstName}`}. Your order is being
          prepared.
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
          <Totals
            subtotal={order.subtotalCents}
            delivery={order.deliveryCents}
            total={order.totalCents}
          />
        </Card>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button label="Continue shopping" variant="ghost" href="/products" />
        <Button label="View my orders" href="/orders" />
      </div>
    </div>
  )
}
