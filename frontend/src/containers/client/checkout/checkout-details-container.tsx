import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { useCart } from '@/api/queries/client/cart'
import { usePlaceOrder } from '@/api/queries/client/orders'
import { useDeliveryMethods } from '@/api/queries/common/catalogue'
import {
  CheckoutDetailsView,
  type PaymentMethod,
} from '@/containers/client/checkout/checkout-details-view'
import { CheckoutFrame } from '@/containers/client/checkout/checkout-frame'
import { CartLoadingState, EmptyCartState } from '@/containers/common/states'
import { clearDetails, readDetails, saveDetails } from '@/lib/client/checkout'
import { readCheckoutForm, type CheckoutErrors } from '@/lib/client/checkout-form'

export function CheckoutDetailsContainer() {
  const navigate = useNavigate()
  const cart = useCart()
  const deliveryMethods = useDeliveryMethods()
  const placeOrder = usePlaceOrder()
  const [saved] = useState(readDetails)

  const [payment, setPayment] = useState<PaymentMethod>(saved?.payment ?? 'card')
  const [deliveryId, setDeliveryId] = useState<string>(() => {
    if (saved && deliveryMethods.some((method) => method.id === saved.deliveryId)) {
      return saved.deliveryId
    }
    const fallback = deliveryMethods.find((method) => method.priceCents > 0) ?? deliveryMethods[0]
    return fallback?.id ?? ''
  })
  const [errors, setErrors] = useState<CheckoutErrors>({})

  if (cart.isPending) {
    return (
      <CheckoutFrame>
        <CartLoadingState />
      </CheckoutFrame>
    )
  }

  const lines = cart.data?.lines ?? []
  if (lines.length === 0) {
    return (
      <CheckoutFrame>
        <EmptyCartState />
      </CheckoutFrame>
    )
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (placeOrder.isPending) return

    const result = readCheckoutForm(new FormData(event.currentTarget), { deliveryId, payment }, saved)
    if (!result.valid) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    saveDetails(result.details)

    const { details } = result
    placeOrder.mutate(
      {
        deliveryMethodId: details.deliveryId,
        paymentMethod: details.payment,
        contactName: details.name,
        contactPhone: details.phone,
        addressLine1: details.line1,
        postalCode: details.postcode,
        city: details.city,
        country: details.country,
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
    <CheckoutFrame>
      <CheckoutDetailsView
        saved={saved}
        errors={errors}
        deliveryMethods={deliveryMethods}
        deliveryId={deliveryId}
        payment={payment}
        summaryItems={lines}
        deliveryCents={deliveryMethods.find((method) => method.id === deliveryId)?.priceCents ?? null}
        isPlacing={placeOrder.isPending}
        placeFailed={placeOrder.isError}
        onDeliveryChange={setDeliveryId}
        onPaymentChange={setPayment}
        onSubmit={handleSubmit}
      />
    </CheckoutFrame>
  )
}
