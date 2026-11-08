import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { getToken } from '@/api/client'
import { useCart } from '@/api/queries/cart'
import { useDeliveryMethods } from '@/api/queries/catalogue'
import { Button } from '@/components/button'
import { Empty } from '@/components/empty'
import { Field } from '@/components/field'
import { Note } from '@/components/note'
import { OrderSummary } from '@/components/order-summary'
import { PageHead } from '@/components/page-head'
import { RadioCard } from '@/components/radio-card'
import { RadioGroup } from '@/components/radio-group'
import { Steps } from '@/components/steps'
import { SubmitButton } from '@/components/submit-button'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/format'
import { readDetails, saveDetails } from '@/lib/checkout'

/** checkout-details: delivery and payment (mockup screen checkout-details).
    The form keeps what the Review order step after it needs in sessionStorage
    (mockup MK.checkout.save), so the saved details fill it again on the way
    back. Only the card's last 4 digits stay; the rest never leaves the form. */

export const Route = createFileRoute('/checkout/details')({
  beforeLoad: () => {
    // The details belong to the account that checks out: a guest signs in
    // first and comes straight back here (decision 2026-11-02).
    if (getToken() === null) {
      throw redirect({ to: '/login', search: { next: '/checkout/details' } })
    }
  },
  component: CheckoutDetailsScreen,
})

type FieldName =
  | 'name'
  | 'email'
  | 'phone'
  | 'line1'
  | 'city'
  | 'postcode'
  | 'country'
  | 'cardNumber'

type FieldErrors = Partial<Record<FieldName, string>>

const requiredFields: { name: FieldName; message: string }[] = [
  { name: 'name', message: 'Enter your full name.' },
  { name: 'email', message: 'Enter your email address.' },
  { name: 'phone', message: 'Enter a phone number.' },
  { name: 'line1', message: 'Enter your address.' },
  { name: 'city', message: 'Enter your city.' },
  { name: 'postcode', message: 'Enter your postcode.' },
  { name: 'country', message: 'Enter your country.' },
]

function CheckoutDetailsScreen() {
  const navigate = useNavigate()
  const cart = useCart()
  const deliveryMethods = useDeliveryMethods()
  const saved = readDetails()

  // The payment shows or hides the card fields; the delivery drives the total.
  const [payment, setPayment] = useState<'card' | 'cod'>(saved?.payment ?? 'card')
  const [deliveryId, setDeliveryId] = useState<string>(() => {
    if (saved?.deliveryId && deliveryMethods.some((method) => method.id === saved.deliveryId)) {
      return saved.deliveryId
    }
    // What the cart shows before the method is chosen: the first paid one.
    const fallback = deliveryMethods.find((method) => method.price > 0) ?? deliveryMethods[0]
    return fallback?.id ?? ''
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  const delivery = deliveryMethods.find((method) => method.id === deliveryId) ?? null
  const lines = cart.data?.lines ?? []
  const head = (
    <>
      <PageHead title="Delivery and payment" />
      <Steps current={1} items={[{ label: 'Delivery and payment' }, { label: 'Review order' }]} />
    </>
  )

  // The cart must answer before the form can stand on it.
  if (cart.isPending) {
    return (
      <div className="flex flex-col gap-(--sp-6)">
        {head}
        <Empty icon="Clock" title="Loading your cart" text="One moment — the lines are on their way." />
      </div>
    )
  }

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

  /** Review order keeps the details (mockup MK.checkout.save) and hands the
      order to the review step. Only the card's last 4 digits stay. */
  const handleReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (name: string) => String(data.get(name) ?? '').trim()

    const found: FieldErrors = {}
    for (const { name, message } of requiredFields) {
      if (value(name) === '') found[name] = message
    }
    if (payment === 'card' && value('cardNumber') === '') found.cardNumber = 'Enter the card number.'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const last4 =
      payment === 'card'
        ? (value('cardNumber').replace(/\D/g, '').slice(-4) || saved?.last4 || undefined)
        : undefined

    saveDetails({
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      line1: value('line1'),
      city: value('city'),
      postcode: value('postcode'),
      country: value('country'),
      deliveryId,
      payment,
      last4,
    })
    void navigate({ to: '/checkout/review' })
  }

  return (
    <div className="flex flex-col gap-(--sp-6)">
      {head}
      <form
        className="grid items-start gap-(--sp-6) lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
        onSubmit={handleReview}
      >
        <div className="flex min-w-0 flex-col gap-(--sp-6)">
          <Card className="gap-4">
            <h2 className="text-lg font-semibold">Contact</h2>
            <Field
              label="Full name"
              name="name"
              defaultValue={saved?.name}
              maxLength={80}
              autoComplete="name"
              error={errors.name}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                name="email"
                type="email"
                defaultValue={saved?.email}
                maxLength={120}
                autoComplete="email"
                error={errors.email}
              />
              <Field
                label="Phone"
                name="phone"
                type="tel"
                defaultValue={saved?.phone}
                maxLength={30}
                autoComplete="tel"
                error={errors.phone}
              />
            </div>
          </Card>
          <Card className="gap-4">
            <h2 className="text-lg font-semibold">Delivery address</h2>
            <Field
              label="Address"
              name="line1"
              defaultValue={saved?.line1}
              maxLength={120}
              autoComplete="address-line1"
              error={errors.line1}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="City"
                name="city"
                defaultValue={saved?.city}
                maxLength={60}
                autoComplete="address-level2"
                error={errors.city}
              />
              <Field
                label="Postcode"
                name="postcode"
                defaultValue={saved?.postcode}
                maxLength={12}
                autoComplete="postal-code"
                error={errors.postcode}
              />
            </div>
            <Field
              label="Country"
              name="country"
              defaultValue={saved?.country}
              maxLength={60}
              autoComplete="country-name"
              error={errors.country}
            />
          </Card>
          <Card className="gap-4">
            <h2 className="text-lg font-semibold">Delivery method</h2>
            <RadioGroup label="Delivery method">
              {deliveryMethods.map((method) => (
                <RadioCard
                  key={method.id}
                  name="deliveryId"
                  value={method.id}
                  title={method.name}
                  text={method.time}
                  trail={method.price === 0 ? 'Free' : formatPrice(method.price * 100)}
                  checked={method.id === deliveryId}
                  onChange={() => setDeliveryId(method.id)}
                />
              ))}
            </RadioGroup>
          </Card>
          <Card className="gap-4">
            <h2 className="text-lg font-semibold">Payment</h2>
            <RadioGroup label="Payment method">
              <RadioCard
                name="payment"
                value="card"
                title="Card"
                text="Visa or Mastercard"
                checked={payment === 'card'}
                onChange={() => setPayment('card')}
              />
              <RadioCard
                name="payment"
                value="cod"
                title="Cash on delivery"
                text="Pay when you receive the order"
                checked={payment === 'cod'}
                onChange={() => setPayment('cod')}
              />
            </RadioGroup>
            {payment === 'card' ? (
              <div className="flex flex-col gap-4" data-slot="card-fields">
                <Field
                  label="Card number"
                  name="cardNumber"
                  inputMode="numeric"
                  maxLength={23}
                  autoComplete="off"
                  error={errors.cardNumber}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Expiry date"
                    name="cardExpiry"
                    placeholder="MM/YY"
                    maxLength={7}
                    autoComplete="off"
                  />
                  <Field
                    label="Security code"
                    name="cardCvc"
                    inputMode="numeric"
                    maxLength={4}
                    autoComplete="off"
                  />
                </div>
              </div>
            ) : null}
          </Card>
          <Note />
        </div>
        <aside aria-label="Order summary">
          <div className="flex flex-col gap-(--sp-3)">
            <OrderSummary
              items={lines.map((line) => ({ ...line, unitPriceCents: line.priceCents }))}
              delivery={delivery ? Math.round(delivery.price * 100) : null}
              deliveryLabel="Delivery"
            />
            <SubmitButton label="Review order" variant="block" />
            <Button label="Back to cart" variant="ghost block" href="/cart" />
          </div>
        </aside>
      </form>
    </div>
  )
}
