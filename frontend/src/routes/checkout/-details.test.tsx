import type { CartData, CartLineData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setToken } from '@/api/client'
import { readDetails, saveDetails } from '@/lib/checkout'
import { routeTree } from '@/routeTree.gen'

/**
 * The delivery and payment screen against the real query hooks, the real
 * router and the real shell; only the HTTP layer (`apiRequest`) is stubbed.
 */
const apiRequest = vi.hoisted(() => vi.fn())

vi.mock('@/api/client', async (importOriginal) => {
  const actual = importOriginal<typeof import('@/api/client')>()
  return { ...(await actual), apiRequest }
})

const maya = { id: 1, role: 'client', name: 'Maya Keller', email: 'maya.keller@example.com', phone: null }

const halden: CartLineData = {
  productId: 'au-halden-nc',
  name: 'Halden NC Headphones',
  priceCents: 27900,
  quantity: 2,
  lineTotalCents: 55800,
  image: 'products/au-halden-nc.jpg',
}

/** Answers the endpoints the screen's shell and form read: the cart and the
    signed-in account; a mistaken call to anything else fails loudly. */
const stubCart = (cart: CartData) => {
  apiRequest.mockImplementation(async (path: string, options: { method?: string } = {}) => {
    const method = options.method ?? 'GET'
    if (path === '/cart' && method === 'GET') return cart
    // The shell's wish-list counter; the screen itself never reads it.
    if (path === '/me' || path === '/wishlist') return []
    throw new Error(`unexpected API call: ${method} ${path}`)
  })
}

const renderScreen = async (signedIn = true) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (signedIn) {
    setToken('signed-in-token')
    queryClient.setQueryData(['me'], maya)
  }

  const history = createMemoryHistory({ initialEntries: ['/checkout/details'] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, queryClient }
}

const summary = () => within(screen.getByRole('complementary', { name: 'Order summary' }))

/** The form is up once its first field is: the cart query answered before it. */
const formReady = async () => {
  await screen.findByLabelText('Full name')
  return screen.getByRole('textbox', { name: 'Full name' })
}

const fieldLabels = {
  name: 'Full name',
  email: 'Email',
  phone: 'Phone',
  line1: 'Address',
  city: 'City',
  postcode: 'Postcode',
  country: 'Country',
} as const

const FieldValues = {
  name: 'Maya Keller',
  email: 'maya.keller@example.com',
  phone: '+353 87 555 0142',
  line1: '14 Harbour Road',
  city: 'Galway',
  postcode: 'H91 X2K7',
  country: 'Ireland',
  cardNumber: '4242 4242 4242 4242',
}

/** Fills every required field, optionally leaving one named field empty. */
const fillForm = async (skip?: string) => {
  for (const [name, label] of Object.entries(fieldLabels)) {
    if (name === skip) continue
    await userEvent.type(screen.getByRole('textbox', { name: label }), FieldValues[name as keyof typeof fieldLabels])
  }
  if (skip !== 'cardNumber') {
    await userEvent.type(screen.getByRole('textbox', { name: 'Card number' }), FieldValues.cardNumber)
  }
}

const savedDetails = {
  name: 'Maya Keller',
  email: 'maya.keller@example.com',
  phone: '+353 87 555 0142',
  line1: '14 Harbour Road',
  city: 'Galway',
  postcode: 'H91 X2K7',
  country: 'Ireland',
  deliveryId: 'express',
  payment: 'cod',
} as const

beforeEach(() => {
  sessionStorage.clear()
  apiRequest.mockReset()
})

describe('checkout-details screen', () => {
  it('sends a guest to sign in, with the details screen as the way back', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    const { router } = await renderScreen(false)
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    expect(router.state.location.search).toEqual({ next: '/checkout/details' })
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('shows the steps, the contact, the address, the delivery and the payment, in order', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderScreen()
    await screen.findByRole('heading', { level: 1, name: 'Delivery and payment' })

    expect(screen.getByRole('list', { name: 'Checkout, step 1 of 2' })).toBeVisible()
    for (const label of Object.values(fieldLabels)) {
      expect(screen.getByRole('textbox', { name: label })).toBeVisible()
    }
    // The card fields are part of the card payment radio card (mockup `card-fields`).
    expect(screen.getByRole('textbox', { name: 'Card number' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Expiry date' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Security code' })).toBeVisible()

    expect(summary().getByRole('heading', { name: 'Order summary' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Review order' })).toBeEnabled()
    expect(screen.getByRole('link', { name: 'Back to cart' })).toHaveAttribute('href', '/cart')
    expect(screen.getByText('Requires legal validation before implementation.')).toBeVisible()
  })

  it('shows the order summary with the cart lines and the delivery total', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderScreen()
    await formReady()

    expect(screen.getByText('Halden NC Headphones × 2')).toBeVisible()
    // The one line's total and the subtotal line; the total with the delivery.
    expect(summary().getByText('€4.90')).toBeVisible()
    expect(summary().getByText('€562.90')).toBeVisible()
  })

  it('follows the chosen delivery method into the summary total', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderScreen()
    await screen.findByRole('heading', { name: 'Order summary' })

    await userEvent.click(screen.getByRole('radio', { name: /Store pickup/ }))
    // Free delivery: the subtotal line, the item's line and the total agree.
    expect(summary().getAllByText('€558.00')).toHaveLength(3)
    expect(summary().getByText('Free')).toBeVisible()
  })

  it('shows the card fields for card payment and hides them for cash on delivery', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderScreen()
    await formReady()

    expect(screen.getByRole('radio', { name: /Visa or Mastercard/ })).toBeChecked()
    expect(screen.getByRole('textbox', { name: 'Card number' })).toBeVisible()

    await userEvent.click(screen.getByRole('radio', { name: /Cash on delivery/ }))
    expect(screen.queryByRole('textbox', { name: 'Card number' })).toBeNull()
    expect(screen.queryByRole('textbox', { name: 'Expiry date' })).toBeNull()

    await userEvent.click(screen.getByRole('radio', { name: /Visa or Mastercard/ }))
    expect(screen.getByRole('textbox', { name: 'Card number' })).toBeVisible()
  })

  it('blocks the review and shows an inline error when a required field is empty', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderScreen()
    await formReady()
    await fillForm('postcode')

    await userEvent.click(screen.getByRole('button', { name: 'Review order' }))

    expect(screen.getByText('Enter your postcode.')).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Postcode' })).toBeInvalid()
    // The review step never opened: the form stays filled in place.
    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveValue('Maya Keller')
    expect(readDetails()).toBeNull()
  })

  it('requires the card number for card payment, but not for cash on delivery', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderScreen()
    await formReady()
    await fillForm('cardNumber')

    await userEvent.click(screen.getByRole('button', { name: 'Review order' }))
    expect(screen.getByText('Enter the card number.')).toBeVisible()

    await userEvent.click(screen.getByRole('radio', { name: /Cash on delivery/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Review order' }))
    // The order went ahead with no card number asked for.
    await waitFor(() => expect(screen.queryByText('Enter the card number.')).toBeNull())
  })

  it('keeps the details and hands the order to the review step', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    const { router } = await renderScreen()
    await formReady()
    await fillForm()

    await userEvent.click(screen.getByRole('button', { name: 'Review order' }))

    expect(readDetails()).toMatchObject({
      name: 'Maya Keller',
      email: 'maya.keller@example.com',
      phone: '+353 87 555 0142',
      line1: '14 Harbour Road',
      city: 'Galway',
      postcode: 'H91 X2K7',
      country: 'Ireland',
      deliveryId: 'standard',
      payment: 'card',
      last4: '4242',
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/checkout/review'))
  })

  it('refills the form from the details saved earlier', async () => {
    stubCart({ lines: [halden], subtotalCents: halden.lineTotalCents })
    saveDetails({ ...savedDetails })
    await renderScreen()
    await formReady()

    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveValue('Maya Keller')
    expect(screen.getByRole('textbox', { name: 'Address' })).toHaveValue('14 Harbour Road')
    expect(screen.getByRole('radio', { name: /Cash on delivery/ })).toBeChecked()
    // Card payment hides the card fields again: the payment kept its state.
    expect(screen.queryByRole('textbox', { name: 'Card number' })).toBeNull()
  })

  it('shows the empty state when the cart holds nothing', async () => {
    stubCart({ lines: [], subtotalCents: 0 })
    await renderScreen()

    expect(await screen.findByText('Your cart is empty')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute('href', '/products')
    expect(screen.queryByRole('button', { name: 'Review order' })).toBeNull()
  })

  it('shows a loading state while the cart answers', async () => {
    apiRequest.mockImplementation((path: string) => {
      if (path === '/cart') return new Promise(() => {})
      throw new Error(`unexpected API call: ${path}`)
    })
    await renderScreen()

    expect(screen.getByText('Loading your cart')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Review order' })).toBeNull()
  })
})
