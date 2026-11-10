import type { DeliveryOption } from '@/api/queries/common/catalogue'
import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { OrderSummary, type SummaryItem } from '@/components/client/order-summary'
import { Field } from '@/components/forms/field'
import { RadioCard } from '@/components/forms/radio-card'
import { RadioGroup } from '@/components/forms/radio-group'
import { SubmitButton } from '@/components/forms/submit-button'
import { Card } from '@/components/ui/card'
import type { CheckoutDetails } from '@/lib/client/checkout'
import type { CheckoutErrors } from '@/lib/client/checkout-form'
import { formatDeliveryPrice } from '@/lib/format'

export type PaymentMethod = CheckoutDetails['payment']

export interface CheckoutDetailsViewProps {
  saved: CheckoutDetails | null
  errors: CheckoutErrors
  deliveryMethods: DeliveryOption[]
  deliveryId: string
  payment: PaymentMethod
  summaryItems: SummaryItem[]
  deliveryCents: number | null
  isPlacing: boolean
  placeFailed: boolean
  onDeliveryChange: (deliveryId: string) => void
  onPaymentChange: (payment: PaymentMethod) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </Card>
  )
}

export function CheckoutDetailsView({
  saved,
  errors,
  deliveryMethods,
  deliveryId,
  payment,
  summaryItems,
  deliveryCents,
  isPlacing,
  placeFailed,
  onDeliveryChange,
  onPaymentChange,
  onSubmit,
}: CheckoutDetailsViewProps) {
  return (
    <form
      className="grid items-start gap-(--sp-6) lg:grid-cols-[minmax(0,1fr)_20rem]"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="flex min-w-0 flex-col gap-(--sp-6)">
        <SectionCard title="Contact">
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
        </SectionCard>
        <SectionCard title="Delivery address">
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
        </SectionCard>
        <SectionCard title="Delivery method">
          <RadioGroup label="Delivery method">
            {deliveryMethods.map((method) => (
              <RadioCard
                key={method.id}
                name="deliveryId"
                value={method.id}
                title={method.name}
                text={method.time}
                trail={formatDeliveryPrice(method.priceCents)}
                checked={method.id === deliveryId}
                onChange={() => onDeliveryChange(method.id)}
              />
            ))}
          </RadioGroup>
        </SectionCard>
        <SectionCard title="Payment">
          <RadioGroup label="Payment method">
            <RadioCard
              name="payment"
              value="card"
              title="Card"
              text="Visa or Mastercard"
              checked={payment === 'card'}
              onChange={() => onPaymentChange('card')}
            />
            <RadioCard
              name="payment"
              value="cod"
              title="Cash on delivery"
              text="Pay when you receive the order"
              checked={payment === 'cod'}
              onChange={() => onPaymentChange('cod')}
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
        </SectionCard>
        {placeFailed ? (
          <Empty
            icon="TriangleExclamationPoint"
            title="Placing your order failed"
            text="The order did not go through. Try again in a moment."
          />
        ) : null}
      </div>
      <aside aria-label="Order summary">
        <div className="flex flex-col gap-(--sp-3)">
          <OrderSummary items={summaryItems} delivery={deliveryCents} />
          <SubmitButton label="Place order" variant="block" disabled={isPlacing} />
          <Button label="Back to cart" variant="ghost block" href="/cart" />
        </div>
      </aside>
    </form>
  )
}
