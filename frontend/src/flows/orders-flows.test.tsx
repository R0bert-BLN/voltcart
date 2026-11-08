/**
 * Module 6 Orders, end to end:
 * the two screens of the module and the flows between them — getting into the
 * history as a guest, walking from the list into one order and back, the
 * status filter that stands in the address, and buy again into the cart. Only
 * the HTTP layer (`apiRequest`) is stubbed, so the real query hooks, the real
 * router and the real shell are exercised.
 */
import type {
  CartData,
  CartLineData,
  OrderData,
  OrderSummaryData,
  UserData,
} from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, setToken } from '@/api/client'
import { products } from '@/lib/mock-data'
import { routeTree } from '@/routeTree.gen'

const apiRequest = vi.hoisted(() => vi.fn())

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, apiRequest }
})

const maya: UserData = {
  id: 1,
  role: 'client',
  name: 'Maya Keller',
  email: 'maya.keller@example.com',
  phone: null,
}

/** One ordered line, priced from the demo catalogue. */
const item = (productId: string, quantity: number): OrderData['items'][number] => {
  const product = products.find((candidate) => candidate.id === productId)!
  return {
    productId,
    name: product.name,
    unitPriceCents: product.price * 100,
    quantity,
    lineTotalCents: product.price * 100 * quantity,
  }
}

const haldenAndCorvo = () => [item('au-halden-nc', 2), item('ph-corvo-6', 1)]

/** One cart line, the stored form of the same order line. */
const cartLine = (productId: string, quantity: number): CartLineData => {
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

const orderOf = (
  id: string,
  status: OrderData['status'],
  createdAt: string,
  items: OrderData['items'],
): OrderData => {
  const subtotalCents = items.reduce((sum, candidate) => sum + candidate.lineTotalCents, 0)
  return {
    id,
    status,
    paymentMethod: 'card',
    subtotalCents,
    deliveryCents: 490,
    totalCents: subtotalCents + 490,
    estimatedAt: '2026-11-20T12:00:00.000Z',
    createdAt,
    items,
    contactName: maya.name,
    contactPhone: '+49 30 123456',
    addressLine1: 'Torstraße 140',
    postalCode: '10119',
    city: 'Berlin',
    country: 'Germany',
    deliveryMethodName: 'Courier',
    deliveryMethodDays: 3,
  }
}

const summaryOf = (order: OrderData): OrderSummaryData => ({
  id: order.id,
  status: order.status,
  paymentMethod: order.paymentMethod,
  subtotalCents: order.subtotalCents,
  deliveryCents: order.deliveryCents,
  totalCents: order.totalCents,
  estimatedAt: order.estimatedAt,
  createdAt: order.createdAt,
  itemCount: order.items.reduce((sum, candidate) => sum + candidate.quantity, 0),
})

const processing = () => orderOf('VC-20433', 'processing', '2026-11-10T09:00:00.000Z', haldenAndCorvo())
const shipped = () => orderOf('VC-20381', 'shipped', '2026-10-28T14:30:00.000Z', [item('ph-corvo-6', 1)])
const delivered = () => orderOf('VC-20190', 'delivered', '2026-10-02T11:00:00.000Z', haldenAndCorvo())

const cartOf = (lines: CartLineData[]): CartData => ({
  lines,
  subtotalCents: lines.reduce((sum, candidate) => sum + candidate.lineTotalCents, 0),
})

/** Answers the module's endpoints the way the backend does, keeping the cart
    in local state and capping each cart line at the product's stock; anything
    else fails. */
const stubApi = (orders: OrderData[]) => {
  let cart: CartData = { lines: [], subtotalCents: 0 }

  apiRequest.mockImplementation(
    async (path: string, options: { method?: string; body?: unknown } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/me') return maya
      if (path === '/wishlist') return []
      if (path === '/cart') return cart
      if (method === 'POST' && path === '/login') return { token: 'fresh-token', user: maya }

      if (path === '/orders') return orders.map(summaryOf)
      const orderMatch = path.match(/^\/orders\/([^/]+)$/)
      if (orderMatch) {
        const order = orders.find((candidate) => candidate.id === decodeURIComponent(orderMatch[1]))
        if (order === undefined) throw new ApiError(404, 'Not found')
        return order
      }

      const cartMatch = path.match(/^\/cart\/([^/]+)$/)
      if (cartMatch && method === 'PUT') {
        const productId = decodeURIComponent(cartMatch[1])
        const { quantity } = options.body as { quantity: number }
        const product = products.find((candidate) => candidate.id === productId)!
        const lines = cart.lines.filter((candidate) => candidate.productId !== productId)
        if (quantity > 0) lines.push(cartLine(productId, Math.min(quantity, product.stock)))
        cart = cartOf(lines)
        return cart
      }

      throw new Error(`unexpected API call: ${method} ${path}`)
    },
  )

  return {
    cart: () => cart,
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

const onScreen = async (name: string) =>
  waitFor(() => expect(screen.getByRole('heading', { level: 1, name })).toBeVisible())

/** The password input is typed through its name: the label text belongs to it
    too, so the helper keeps the email field's accessor apart. */
const inputField = (name: string): HTMLElement => {
  const input = document.querySelector(`input[name="${name}"]`)
  if (!(input instanceof HTMLElement)) throw new Error(`${name} field missing`)
  return input
}

/** Signs in through the real form, the way the flow under test arrives. */
const signIn = async () => {
  await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), maya.email)
  await userEvent.type(inputField('password'), 'correct-horse')
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  apiRequest.mockReset()
})

describe('order flows', () => {
  it('walks every screen of the module in order, and back', async () => {
    stubApi([processing(), shipped(), delivered()])
    const { router } = await renderApp('/orders')
    await onScreen('Order history')

    // The list heads with the count and rows sit in data order, newest first.
    expect(screen.getByText('3 orders')).toBeVisible()
    const table = await screen.findByRole('table')
    expect([...table.querySelectorAll('tbody tr')].map((row) => row.getAttribute('data-id'))).toEqual([
      'VC-20433',
      'VC-20381',
      'VC-20190',
    ])

    // On: the order number of the newest order opens its details.
    await userEvent.click(screen.getByRole('link', { name: 'VC-20433' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/orders/VC-20433'))
    await onScreen('Order VC-20433')
    expect(screen.getByText('Placed 10 Nov 2026 · 3 items')).toBeVisible()

    // The order stands on the backend's data: items, money and the status card.
    expect(screen.getByText('Halden NC Headphones')).toBeVisible()
    expect(screen.getByText('2 × €279.00')).toBeVisible()
    expect(screen.getByText('€1,357.00')).toBeVisible()
    expect(screen.getByText('€4.90')).toBeVisible()
    expect(screen.getByText('€1,361.90')).toBeVisible()
    expect(screen.getByText('Processing')).toBeVisible()

    // And back: the trail returns to the history, still listing all three.
    await userEvent.click(screen.getByRole('link', { name: 'My orders' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/orders'))
    await onScreen('Order history')
    await waitFor(() => {
      expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(3)
    })
  })

  it('sends a guest through sign in, back to the history they came from', async () => {
    stubApi([processing()])
    const { router } = await renderApp('/orders', false)

    // The history belongs to the account: sign in first, with the way back.
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.search).toEqual({ next: '/orders' })

    await signIn()
    await waitFor(() => expect(router.state.location.pathname).toBe('/orders'))
    await onScreen('Order history')
    expect((await screen.findByRole('table')).querySelectorAll('tbody tr')).toHaveLength(1)
    expect(apiRequest.mock.calls.some(([path, options]) => path === '/login' && (options as { method?: string } | undefined)?.method === 'POST')).toBe(true)
  })

  it('keeps the chosen status filter across a visit to an order and back', async () => {
    stubApi([processing(), shipped(), delivered()])
    const { router } = await renderApp('/orders')
    await onScreen('Order history')
    await screen.findByRole('table')

    // The Shipped chip narrows the list and stands in the address.
    await userEvent.click(screen.getByRole('button', { name: 'Shipped' }))
    await waitFor(() => {
      expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1)
    })
    expect(router.state.location.search).toEqual({ status: 'shipped' })

    // Into the one shipped order, and back in the browser: the history opens
    // the way it was left, under the same filter.
    await userEvent.click(screen.getByRole('link', { name: 'View details of order VC-20381' }))
    await onScreen('Order VC-20381')
    router.history.back()
    await waitFor(() => expect(router.state.location.pathname).toBe('/orders'))
    await onScreen('Order history')
    await waitFor(() => {
      expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1)
    })
    expect(router.state.location.search).toEqual({ status: 'shipped' })
    expect(screen.getByRole('button', { name: 'Shipped' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('VC-20433')).not.toBeInTheDocument()
  })

  it('buy again puts the order back into the cart and opens the cart', async () => {
    const api = stubApi([processing()])
    const { router } = await renderApp('/orders')
    await onScreen('Order history')

    await userEvent.click(screen.getByRole('link', { name: 'View details of order VC-20433' }))
    await onScreen('Order VC-20433')

    // Every line goes back at its ordered quantity, on top of nothing.
    await userEvent.click(await screen.findByRole('button', { name: 'Buy again' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/cart'))
    expect(api.calls()).toContainEqual(['/cart/au-halden-nc', { method: 'PUT', body: { quantity: 2 } }])
    expect(api.calls()).toContainEqual(['/cart/ph-corvo-6', { method: 'PUT', body: { quantity: 1 } }])
    expect(await screen.findByText('2 products added to your cart.')).toBeVisible()

    // The cart the order filled is the cart on screen.
    await onScreen('Your cart')
    expect(screen.getByText('2 items')).toBeVisible()
    expect(screen.getByText('Halden NC Headphones')).toBeVisible()
    expect(screen.getByText('Corvo 6 Smartphone')).toBeVisible()
  })
})
