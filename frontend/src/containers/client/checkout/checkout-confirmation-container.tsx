import { getRouteApi } from '@tanstack/react-router'

import { useMe } from '@/api/queries/common/auth'
import { useOrder } from '@/api/queries/client/orders'
import { CheckoutConfirmationView } from '@/containers/client/checkout/checkout-confirmation-view'
import { ConfirmationLoadingState, NoOrderToConfirmState } from '@/containers/common/states'
import { firstName } from '@/lib/format'

const route = getRouteApi('/checkout/confirmation')

export function CheckoutConfirmationContainer() {
  const { id } = route.useSearch()
  const orderQuery = useOrder(id)
  const me = useMe()

  if (orderQuery.isPending) return <ConfirmationLoadingState />
  if (orderQuery.isError || orderQuery.data === null) return <NoOrderToConfirmState />

  return (
    <CheckoutConfirmationView
      order={orderQuery.data}
      customerFirstName={firstName(me.data?.name ?? '')}
    />
  )
}
