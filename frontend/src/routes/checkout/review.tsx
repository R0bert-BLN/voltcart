import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { getToken } from '@/api/client'
import { useCart } from '@/api/queries/cart'
import { useDeliveryMethods } from '@/api/queries/catalogue'
import { usePlaceOrder } from '@/api/queries/orders'
import { Button } from '@/components/common/button'
import { Check } from '@/components/forms/check'
import { ContactBlock } from '@/components/orders/contact-block'
import { DeliveryBlock } from '@/components/orders/delivery-block'
import { Empty } from '@/components/common/empty'
import { List } from '@/components/common/list'
import { OrderLine } from '@/components/orders/order-line'
import { PageHead } from '@/components/common/page-head'
import { SectionTitle } from '@/components/common/section-title'
import { Steps } from '@/components/checkout/steps'
import { SubmitButton } from '@/components/forms/submit-button'
import { Totals } from '@/components/orders/totals'
import { Card } from '@/components/ui/card'
import { clearDetails, readDetails } from '@/lib/checkout'

/** checkout-review: review order (mockup screen checkout-review). The
    Delivery and payment step keeps its details in sessionStorage
    (mockup MK.checkout.save); this step shows them once more and hands the
    order to POST /checkout, which reduces the stock, empties the cart and
    answers with the order the confirmation step opens. */

export const Route = createFileRoute('/checkout/review')({
  beforeLoad: () => {
    // The order belongs to the account that checks out: a guest signs in
    // first and comes straight back here.
    if (getToken() === null) {
      throw redirect({ to: '/login', search: { next: '/checkout/review' } })
    }
  },
  component: CheckoutReviewScreen,
})

/** The "Edit" action of a review card: back to the step that owns it. */
const editLink = (label: string) => (
  <Button label="Edit" variant="ghost" href="/checkout/details" aria-label={`Edit ${label.toLowerCase()}`} />
)

function CheckoutReviewScreen() {
  const navigate = useNavigate()
  const cart = useCart()
  const deliveryMethods = useDeliveryMethods()
  const placeOrder = usePlaceOrder()
  const draft = readDetails()

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)

  const head = (
    <>
      <PageHead title="Review order" />
      <Steps current={2} items={[{ label: 'Delivery and payment', href: '/checkout/details' }, { label: 'Review order' }]} />
    </>
  )

  // The cart must answer before the review can stand on it.
  if (cart.isPending) {
    return (
      <div className="flex flex-col gap-(--sp-6)">
        {head}
        <Empty icon="Clock" title="Loading your cart" text="One moment — the lines are on their way." />
      </div>
    )
  }

  const lines = cart.data?.lines ?? []
  if (lines.length === 0) {
    return (
      <div className="flex flex-col gap-(--sp-6)">
        {head}
        <Empty
          icon="ShoppingCart"
          title="Your cart is empty"
          text="Add a product to start your order."
          action={<Button label="Browse all products" href="/products" />}
        />
      </div>
    )
  }

  // A new account has no saved address, so the first step comes first.
  if (!draft?.line1) {
    return (
      <div className="flex flex-col gap-(--sp-6)">
        {head}
        <Empty
          icon="MapPin"
          title="Add your delivery details first"
          action={<Button label="Go to delivery and payment" href="/checkout/details" />}
        />
      </div>
    )
  }

  const items = lines.map((line) => ({ ...line, unitPriceCents: line.priceCents }))
  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0)

  const method = deliveryMethods.find((candidate) => candidate.id === draft.deliveryId) ?? null
  const deliveryCents = method ? Math.round(method.price * 100) : null

  /** One place-order attempt: the terms must be accepted, and the mutation
      runs once (mockup's double-click guard) while no order is in flight. */
  const handlePlace = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (placeOrder.isPending) return
    if (!termsAccepted) {
      setTermsError('Accept the terms to place your order.')
      return
    }
    if (deliveryCents === null) return

    placeOrder.mutate(
      {
        deliveryMethodId: draft.deliveryId,
        paymentMethod: draft.payment,
        contactName: draft.name,
        contactPhone: draft.phone,
        addressLine1: draft.line1,
        postalCode: draft.postcode,
        city: draft.city,
        country: draft.country,
      },
      {
        onSuccess: (order) => {
          clearDetails()
          void navigate({ to: '/checkout/confirmation', search: { id: order.id } })
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-(--sp-6)">
      {head}
      <form
        className="grid items-start gap-(--sp-6) lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
        onSubmit={handlePlace}
      >
        <div className="flex min-w-0 flex-col gap-(--sp-6)">
          <section className="flex flex-col gap-3" aria-label="Items">
            <SectionTitle title="Items" />
            <List>
              {items.map((item) => (
                <OrderLine key={item.productId} item={item} />
              ))}
            </List>
          </section>
          <div className="grid gap-(--sp-6) sm:grid-cols-2">
            <Card>
              <SectionTitle title="Contact and address" action={editLink('Contact and address')} />
              <ContactBlock
                contact={{ name: draft.name, email: draft.email, phone: draft.phone }}
                address={{
                  line1: draft.line1,
                  city: draft.city,
                  postcode: draft.postcode,
                  country: draft.country,
                }}
              />
            </Card>
            <Card>
              <SectionTitle title="Delivery and payment" action={editLink('Delivery and payment')} />
              <DeliveryBlock
                method={method}
                delivery={deliveryCents}
                // The card's digits never leave the form: the step kept the last four only.
                payment={
                  draft.payment === 'cod'
                    ? 'cod'
                    : draft.last4
                      ? `Card ending ${draft.last4}`
                      : 'card'
                }
              />
            </Card>
          </div>
          {placeOrder.isError ? (
            <Empty
              icon="TriangleExclamationPoint"
              title="Placing your order failed"
              text="The order did not go through. Try again in a moment."
            />
          ) : null}
        </div>
        <aside aria-label="Order summary">
          <Card className="gap-4">
            <h2 className="text-(--fs-xl) font-(--fw-semibold) leading-(--lh-tight)">Order summary</h2>
            <Totals subtotal={subtotalCents} delivery={deliveryCents} />
            <Check
              required
              label="I accept the terms of sale."
              name="terms"
              checked={termsAccepted}
              onChange={() => {
                setTermsAccepted((accepted) => !accepted)
                setTermsError(null)
              }}
              error={termsError ?? undefined}
            />
            <SubmitButton label="Place order" variant="block" disabled={placeOrder.isPending} />
          </Card>
        </aside>
      </form>
    </div>
  )
}
