import { Fragment } from 'react'

import type { DeliveryMethodData } from '@/api/generated/types'
import { formatPrice } from '@/lib/format'
import { cn } from 'cn'

const paymentLabels: Record<string, string> = {
  card: 'Card',
  cod: 'Cash on delivery',
}

export interface DeliveryBlockProps extends React.ComponentProps<'div'> {
  /** The chosen method; null while checkout has not picked one. */
  method: Pick<DeliveryMethodData, 'name' | 'days'> | null
  /** Delivery price in cents; 0 or null renders as "Free". */
  delivery: number | null
  /** Payment method of the order ('card' or 'cod'). */
  payment: string
}

/** Wording of a payment method (the mockup's MK.orders.paymentLabel). */
const paymentLabel = (payment: string): string => paymentLabels[payment] ?? payment

/** "1 day" / "2 to 4 days" — the words the mockup puts behind the method name. */
const deliveryTime = (method: Pick<DeliveryMethodData, 'days'> | null): string => {
  const days = method?.days
  return days === null || days === undefined ? '' : days === 1 ? '1 day' : `${days} days`
}

/** Delivery method and payment of an order from the mockup
    (MK.ui.deliveryBlock → .address-block): the method with its time estimate
    and price, then the payment label. */
export function DeliveryBlock({ method, delivery, payment, className, ...props }: DeliveryBlockProps) {
  const detail = [deliveryTime(method), delivery ? formatPrice(delivery) : 'Free']
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      data-slot="address-block"
      className={cn('flex flex-col gap-3 [overflow-wrap:anywhere]', className)}
      {...props}
    >
      <p>
        {method?.name ?? 'Chosen at checkout'}
        <br />
        <span className="text-text-muted">
          {detail.split(' · ').map((part, index) => (
            <Fragment key={part}>
              {index > 0 ? ' · ' : ''}
              {part}
            </Fragment>
          ))}
        </span>
      </p>
      <p>{paymentLabel(payment)}</p>
    </div>
  )
}
