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
 * The review order screen against the real query hooks, the real router and
 * the real shell; only the HTTP layer (`apiRequest`) is stubbed.
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

const savedDetails = {
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
} as const

const placedOrder = {
  id: 'VC-20433',
  status: 'processing',
  paymentMethod: 'card',
  subtotalCents: 55800,
  deliveryCents: 490,
  totalCents: 56290,
  estimatedAt: '2026-11-12T10:00:00.000Z',
  items: [expect.objectContaining({ productId: halden.productId })],
}

/** Answers the endpoints the screen's shell and form read: the cart, the
    POST of the placed order and the signed-in account. */
const stubCassette = (cart: CartData, order = placedOrder) => {
  apiRequest.mockImplementation(async (path: string, options: { method?: string; body?: unknown } = {}) => {
    const method = options.method ?? 'GET'
    if (path === '/cart' && method === 'GET') return cart
    if (path === '/checkout' && method === 'POST') return order
    // The shell's wish-list counter; the screen itself never reads it.
    if (path === '/me' || path === '/orders' || path === '/wishlist') return []
    throw new Error(`unexpected API call: ${method} ${path}`)
  })
}

const renderScreen = async (signedIn = true) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (signedIn) {
    setToken('signed-in-token')
    queryClient.setQueryData(['me'], maya)
  }

  const history = createMemoryHistory({ initialEntries: ['/checkout/review'] })
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

/** The review is up once its heading is: the cart query answered before it. */
const reviewReady = () => screen.findByRole('heading', { level: 1, name: 'Review order' })

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  apiRequest.mockReset()
})

describe('checkout-review screen', () => {
  it('sends a guest to sign in, on their way back to the review step', async () => {
    stubCassette({ lines: [halden], subtotalCents: halden.lineTotalCents })
    const { router } = await renderScreen(false)
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    expect(router.state.location.search).toEqual({ next: '/checkout/review' })
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('shows the steps, the items and the two review cards, in order', async () => {
    stubCassette({ lines: [halden], subtotalCents: halden.lineTotalCents })
    saveDetails({ ...savedDetails })
    await renderScreen()
    await screen.findByRole('heading', { level: 1, name: 'Review order' })

    expect(screen.getByRole('list', { name: 'Checkout, step 2 of 2' })).toBeVisible()
    expect(screen.getByText('Halden NC Headphones')).toBeVisible()
    expect(screen.getByText('2 × €279.00')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Edit contact and address' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Edit delivery and payment' })).toBeVisible()
    expect(screen.getByText('Requires legal validation before implementation.')).toBeVisible()

    // The review content repeats what the details step kept.
    expect(screen.getByText('Maya Keller')).toBeVisible()
    expect(screen.getByText('14 Harbour Road', { exact: false })).toBeVisible()
    expect(screen.getByText(/Standard courier/)).toBeVisible()
    expect(screen.getByText('Card ending 4242')).toBeVisible()
    expect(summary().getByRole('heading', { name: 'Order summary' })).toBeVisible()
    expect(screen.getByRole('checkbox')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled()
  })

  it('shows the totals with the delivery and the total', async () => {
    stubCassette({ lines: [halden], subtotalCents: halden.lineTotalCents })
    saveDetails({ ...savedDetails })
    await renderScreen()
    await reviewReady()

    expect(summary().getByText('€558.00')).toBeVisible()
    expect(summary().getByText('€4.90')).toBeVisible()
    expect(summary().getByText('€562.90')).toBeVisible()
  })

  it('shows a loading state while the cart answers', async () => {
    apiRequest.mockImplementation((path: string) => {
      if (path === '/cart') return new Promise(() => {})
      throw new Error(`unexpected API call: ${path}`)
    })
    await renderScreen()

    expect(screen.getByText('Loading your cart')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Place order' })).toBeNull()
  })

  it('shows the empty state when the cart holds nothing', async () => {
    stubCassette({ lines: [], subtotalCents: 0 })
    saveDetails({ ...savedDetails })
    await renderScreen()

    expect(await screen.findByText('Your cart is empty')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute('href', '/products')
    expect(screen.queryByRole('button', { name: 'Place order' })).toBeNull()
  })

  it('sends a review without delivery details back to the details step', async () => {
    stubCassette({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderScreen()

    expect(await screen.findByText('Add your delivery details first')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Place order' })).toBeNull()
  })

  it('blocks the order until the terms are accepted', async () => {
    stubCassette({ lines: [halden], subtotalCents: halden.lineTotalCents })
    saveDetails({ ...savedDetails })
    await renderScreen()
    await reviewReady()

    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))
    expect(screen.getByText('Accept the terms to place your order.')).toBeVisible()
    expect(apiRequest).not.toHaveBeenCalledWith('/checkout', expect.anything())

    await userEvent.click(screen.getByRole('checkbox'))
    expect(screen.queryByText('Accept the terms to place your order.')).toBeNull()
  })

  it('places the order and opens the confirmation with its id', async () => {
    stubCassette({ lines: [halden], subtotalCents: halden.lineTotalCents })
    const { queryClient, router } = await renderScreen()
    saveDetails({ ...savedDetails })
    await reviewReady()

    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))

    expect(apiRequest).toHaveBeenCalledWith('/checkout', {
      method: 'POST',
      body: {
        deliveryMethodId: 'standard',
        paymentMethod: 'card',
        contactName: 'Maya Keller',
        contactPhone: '+353 87 555 0142',
        addressLine1: '14 Harbour Road',
        postalCode: 'H91 X2K7',
        city: 'Galway',
        country: 'Ireland',
      },
    })
    // The cart emptied, the details dropped and the confirmation opened.
    await waitFor(() => expect(queryClient.getQueryData<CartData>(['cart'])).toEqual({ lines: [], subtotalCents: 0 }))
    expect(readDetails()).toBeNull()
    await waitFor(() => expect(router.state.location.pathname).toBe('/checkout/confirmation'))
    expect(router.state.location.search).toEqual({ id: 'VC-20433' })
  })

  it('shows the failure state and keeps the details when the order does not go through', async () => {
    apiRequest.mockImplementation(async (path: string, options: { method?: string } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/cart' && method === 'GET') return { lines: [halden], subtotalCents: halden.lineTotalCents }
      if (path === '/me' || path === '/orders' || path === '/wishlist') return []
      if (path === '/checkout' && method === 'POST') throw new Error('stock moved on')
      throw new Error(`unexpected API call: ${method} ${path}`)
    })
    saveDetails({ ...savedDetails })
    await renderScreen()
    await reviewReady()

    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))

    expect(await screen.findByText('Placing your order failed')).toBeVisible()
    expect(readDetails()).toMatchObject({ line1: '14 Harbour Road' })
    expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled()
  })
})
