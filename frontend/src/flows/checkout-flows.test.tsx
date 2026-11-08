/**
 * Module 5 Cart and checkout, end to end:
 * the four screens of the module and the flows between them — the cart with
 * its rows, delivery and payment, reviewing and placing the order, and the
 * confirmation. Only the HTTP layer (`apiRequest`) is stubbed, so the real
 * query hooks, the real router and the real shell are exercised.
 */
import type { CartData, CartLineData, OrderData, PlaceOrderData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setToken } from '@/api/client'
import { deliveryMethods, products } from '@/lib/mock-data'
import { routeTree } from '@/routeTree.gen'

const apiRequest = vi.hoisted(() => vi.fn())

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, apiRequest }
})

const maya = {
  id: 1,
  role: 'client',
  name: 'Maya Keller',
  email: 'maya.keller@example.com',
  phone: null,
}

/** One cart line of the demo, with its money in cents. */
const line = (productId: string, quantity: number): CartLineData => {
  const product = products.find((candidate) => candidate.id === productId)!
  return {
    productId,
    name: product.name,
    priceCents: product.price * 100,
    quantity,
    lineTotalCents: product.price * 100 * quantity,
    image: '',
  }
}

const halden = () => line('au-halden-nc', 2)
const vanta = () => line('mn-vanta-34', 1)

const cartOf = (lines: CartLineData[]): CartData => ({
  lines,
  subtotalCents: lines.reduce((sum, candidate) => sum + candidate.lineTotalCents, 0),
})

/** Answers the module's endpoints the way the backend does, keeping the cart
    in local state and building the order from it at POST /checkout; anything
    else fails. */
const stubApi = (initialLines: CartLineData[]) => {
  let cart = cartOf([...initialLines])
  // The id the placed order receives, as the confirmation screen's query needs.
  let order: OrderData | null = null

  apiRequest.mockImplementation(
    async (path: string, options: { method?: string; body?: unknown } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/me') return maya
      if (path === '/wishlist') return []
      if (path === '/cart') return cart

      const cartMatch = path.match(/^\/cart\/([^/]+)$/)
      if (cartMatch && method === 'PUT') {
        const productId = decodeURIComponent(cartMatch[1])
        const { quantity } = options.body as { quantity: number }
        // The backend caps the stored quantity at the product's stock.
        const product = products.find((candidate) => candidate.id === productId)!
        const lines = cart.lines.filter((candidate) => candidate.productId !== productId)
        if (quantity > 0) lines.push(line(productId, Math.min(quantity, product.stock)))
        cart = cartOf(lines)
        return cart
      }
      if (cartMatch && method === 'DELETE') {
        const productId = decodeURIComponent(cartMatch[1])
        cart = cartOf(cart.lines.filter((candidate) => candidate.productId !== productId))
        return undefined
      }

      if (path === '/checkout' && method === 'POST') {
        const body = options.body as PlaceOrderData
        const method_ = deliveryMethods.find((candidate) => candidate.id === body.deliveryMethodId)
        const deliveryCents = method_ ? Math.round(method_.price * 100) : 0
        const items = cart.lines.map((candidate) => ({
          productId: candidate.productId,
          name: candidate.name,
          unitPriceCents: candidate.priceCents,
          quantity: candidate.quantity,
          lineTotalCents: candidate.lineTotalCents,
        }))
        const subtotalCents = cart.subtotalCents
        order = {
          id: 'VC-20433',
          status: 'processing',
          paymentMethod: body.paymentMethod,
          subtotalCents,
          deliveryCents,
          totalCents: subtotalCents + deliveryCents,
          estimatedAt: '2026-11-12T10:00:00.000Z',
          createdAt: '2026-11-10T09:00:00.000Z',
          items,
          contactName: body.contactName,
          contactPhone: body.contactPhone,
          addressLine1: body.addressLine1,
          postalCode: body.postalCode,
          city: body.city,
          country: body.country,
          deliveryMethodName: method_ ? method_.name : 'Chosen at checkout',
          deliveryMethodDays: method_ ? method_.days : 0,
        }
        // The placed order takes the cart with it.
        cart = { lines: [], subtotalCents: 0 }
        return order
      }

      if (path === '/orders/VC-20433') return order

      throw new Error(`unexpected API call: ${method} ${path}`)
    },
  )

  return {
    calls: () => apiRequest.mock.calls as [string, { method?: string; body?: unknown }?][],
  }
}

const renderApp = async (path: string, signedIn = true) => {
  // Like the app: a fresh query client per session, optional signed-in user.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (signedIn) {
    queryClient.setQueryData(['me'], maya)
    setToken('signed-in-token')
  }
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router }
}

/** The first link with this href; throws a readable error when missing. */
const linkByHref = (href: string): HTMLElement => {
  const link = document.querySelector(`a[href="${href}"]`)
  if (!(link instanceof HTMLElement)) throw new Error(`no link to ${href}`)
  return link
}

const onScreen = async (name: string) =>
  waitFor(() => expect(screen.getByRole('heading', { level: 1, name })).toBeVisible())

const typeInto = async (label: string, value: string) => {
  await userEvent.clear(screen.getByLabelText(label))
  if (value !== '') await userEvent.type(screen.getByLabelText(label), value)
}

/** Fills the details form the way the demo account does and goes on to the
    review step; the card's fields only stand while Card is chosen. */
const fillDetails = async () => {
  await typeInto('Full name', 'Maya Keller')
  await typeInto('Email', 'maya.keller@example.com')
  await typeInto('Phone', '+353 87 555 0142')
  await typeInto('Address', '14 Harbour Road')
  await typeInto('City', 'Galway')
  await typeInto('Postcode', 'H91 X2K7')
  await typeInto('Country', 'Ireland')
  await typeInto('Card number', '4242 4242 4242 4242')
  await userEvent.click(screen.getByRole('button', { name: 'Review order' }))
}

/** The newest toast: earlier ones may still be fading out. */
const toast = () => {
  const toasts = document.querySelectorAll('[data-slot="toast"]')
  return toasts[toasts.length - 1]
}

/** The cart's summary panel (mockup .summary → aside). */
const orderSummaryAside = (): HTMLElement => {
  const aside = document.querySelector<HTMLElement>('aside[aria-label="Order summary"]')
  if (!aside) throw new Error('no order summary aside')
  return aside
}

/** One cart row, fresh from the document: a write replaces the rows. */
const row = (productId: string): HTMLElement => {
  const tr = document.querySelector<HTMLElement>(`tr[data-line='${productId}']`)
  if (!tr) throw new Error(`no cart row for ${productId}`)
  return tr
}

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  apiRequest.mockReset()
})

describe('checkout flows', () => {
  it('walks every screen of the module in order, and back', async () => {
    stubApi([halden(), vanta()])
    const { router } = await renderApp('/cart')
    await onScreen('Your cart')

    // The cart keeps both rows and the summary estimates the first paid method.
    expect(screen.getByText('2 items')).toBeVisible()
    expect(within(orderSummaryAside()).getByText('€4.90')).toBeVisible()

    // On: Continue to checkout leads to delivery and payment.
    await userEvent.click(linkByHref('/checkout/details'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/checkout/details'))
    await onScreen('Delivery and payment')
    expect(screen.getByRole('list', { name: 'Checkout, step 1 of 2' })).toBeInTheDocument()

    // The form stands on the cart: both lines answer in its summary.
    expect(screen.getByText('Halden NC Headphones × 2')).toBeVisible()
    expect(screen.getByText('€1,037.00')).toBeVisible()

    // The details go in, saved for the review step after this one.
    await fillDetails()
    await waitFor(() => expect(router.state.location.pathname).toBe('/checkout/review'))
    await onScreen('Review order')
    expect(screen.getByText('Maya Keller')).toBeVisible()
    expect(screen.getByText('Card ending 4242')).toBeVisible()

    // And back: the edit action lands on the step that owns the details, which
    // kept them, and from there the way back to the cart is open again.
    await userEvent.click(screen.getByRole('link', { name: 'Edit delivery and payment' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/checkout/details'))
    await onScreen('Delivery and payment')
    expect(screen.getByLabelText('Full name')).toHaveValue('Maya Keller')
    // The card's digits never stay in the form: only the review showed the last 4.
    expect(screen.getByLabelText('Card number')).toHaveValue('')

    await userEvent.click(screen.getByRole('link', { name: 'Back to cart' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/cart'))
    await onScreen('Your cart')
    expect(screen.getByText('2 items')).toBeVisible()
  })

  it('places the order: the cart goes in, the empty cart shows in the top bar', async () => {
    const api = stubApi([halden(), vanta()])
    await renderApp('/cart')
    await onScreen('Your cart')

    await userEvent.click(linkByHref('/checkout/details'))
    await onScreen('Delivery and payment')
    await fillDetails()
    await onScreen('Review order')

    // The terms gate the order: the placement runs when they are accepted.
    const checkbox = screen.getByRole('checkbox', { name: 'I accept the terms of sale.' })
    await userEvent.click(checkbox)
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))

    // The order was built from the cart in the backend.
    expect(api.calls()).toContainEqual([
      '/checkout',
      {
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
      },
    ])

    // The confirmation opens the order the review placed.
    await onScreen('Order confirmed')
    expect(screen.getByText(/Thank you, Maya/)).toBeVisible()
    expect(screen.getByText('VC-20433')).toBeVisible()
    expect(screen.getByText('Halden NC Headphones')).toBeVisible()
    expect(screen.getByText('2 × €279.00')).toBeVisible()
    expect(screen.getByText('€1,037.00')).toBeVisible()
    expect(screen.getByText('€1,041.90')).toBeVisible()

    // The cart the order took left: the top bar counts nothing any more, and
    // the cart query ran again for the fresh, empty cart.
    await waitFor(() => expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument())
    const cartGets = api.calls().filter(
      ([path, options]) => path === '/cart' && (options?.method ?? 'GET') === 'GET',
    )
    expect(cartGets.length).toBeGreaterThanOrEqual(2)
  })

  it('keeps the cart rows in step: a quantity write, a remove, and the empty state', async () => {
    const api = stubApi([halden(), vanta()])
    await renderApp('/cart')
    await onScreen('Your cart')

    // One more Halden: the PUT carries the new quantity and the line follows.
    await userEvent.click(within(row('au-halden-nc')).getByRole('button', { name: 'Increase' }))
    expect(api.calls()).toContainEqual([
      '/cart/au-halden-nc',
      { method: 'PUT', body: { quantity: 3 } },
    ])
    // The fresh cart replaces the cached one: line and subtotal follow at once.
    await waitFor(() => expect(screen.getByText('€837.00')).toBeVisible())
    await waitFor(() => expect(screen.getByText('€1,316.00')).toBeVisible())

    // Remove clears the row with a word, straight away.
    await userEvent.click(
      within(row('au-halden-nc')).getByRole('button', {
        name: 'Remove Halden NC Headphones from the cart',
      }),
    )
    await waitFor(() => expect(toast()).toHaveTextContent('Halden NC Headphones removed from your cart.'))
    expect(screen.queryByText('Halden NC Headphones')).not.toBeInTheDocument()
    expect(api.calls()).toContainEqual(['/cart/au-halden-nc', { method: 'DELETE' }])

    // The last row removed, the cart reads empty and points to the catalogue.
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Vanta 34 Ultrawide Monitor from the cart' }),
    )
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible(),
    )
    await userEvent.click(screen.getByRole('link', { name: 'Browse all products' }))
    await onScreen('All products')
  })

  it('checks the details before the review: the errors stand under the empty fields', async () => {
    stubApi([halden(), vanta()])
    const { router } = await renderApp('/checkout/details')
    await onScreen('Delivery and payment')

    // Nothing filled: every required field asks for itself, and card too.
    await userEvent.click(screen.getByRole('button', { name: 'Review order' }))
    expect(screen.getByText('Enter your full name.')).toBeVisible()
    expect(screen.getByText('Enter your email address.')).toBeVisible()
    expect(screen.getByText('Enter a phone number.')).toBeVisible()
    expect(screen.getByText('Enter your address.')).toBeVisible()
    expect(screen.getByText('Enter your city.')).toBeVisible()
    expect(screen.getByText('Enter your postcode.')).toBeVisible()
    expect(screen.getByText('Enter your country.')).toBeVisible()
    expect(screen.getByText('Enter the card number.')).toBeVisible()
    expect(router.state.location.pathname).toBe('/checkout/details')

    // Cash on delivery needs no card: the fields leave with it.
    await userEvent.click(screen.getByRole('radio', { name: /Cash on delivery/ }))
    await waitFor(() =>
      expect(screen.queryByLabelText('Card number')).not.toBeInTheDocument(),
    )

    // The method chosen drives the summary: the express price shows instead.
    await userEvent.click(screen.getByRole('radio', { name: /Express courier/ }))
    await waitFor(() => expect(within(orderSummaryAside()).getByText('€1,046.90')).toBeVisible())
  })

  it('keeps the review step honest: no details, no order; no terms, no order', async () => {
    const api = stubApi([halden(), vanta()])
    const { router } = await renderApp('/checkout/review')
    await onScreen('Review order')

    // A review without the saved details sends back to the step that owns them.
    expect(screen.getByRole('heading', { name: 'Add your delivery details first' })).toBeVisible()
    expect(api.calls().filter(([path]) => path === '/checkout')).toHaveLength(0)
    await userEvent.click(screen.getByRole('link', { name: 'Go to delivery and payment' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/checkout/details'))

    // Back with the details, but the order waits: the terms gate it.
    await fillDetails()
    await onScreen('Review order')
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))
    expect(screen.getByText('Accept the terms to place your order.')).toBeVisible()
    expect(api.calls().filter(([path]) => path === '/checkout')).toHaveLength(0)

    // The acceptance stood in: the next attempt places the order.
    await userEvent.click(screen.getByRole('checkbox', { name: 'I accept the terms of sale.' }))
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))
    await onScreen('Order confirmed')
    expect(api.calls().filter(([path, options]) => path === '/checkout' && options?.method === 'POST')).toHaveLength(1)
  })
})
