import type { CartData, OrderSummaryData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, setToken } from '@/api/client'
import { routeTree } from '@/routeTree.gen'

/**
 * The confirmation screen against the real query hooks, the real router and
 * the real shell; only the HTTP layer (`apiRequest`) is stubbed.
 */
const apiRequest = vi.hoisted(() => vi.fn())

vi.mock('@/api/client', async (importOriginal) => {
  const actual = importOriginal<typeof import('@/api/client')>()
  return { ...(await actual), apiRequest }
})

const maya = { id: 1, role: 'client', name: 'Maya Keller', email: 'maya.keller@example.com', phone: null }

const placedOrder = {
  id: 'VC-20433',
  status: 'processing',
  paymentMethod: 'card',
  subtotalCents: 55800,
  deliveryCents: 490,
  totalCents: 56290,
  estimatedAt: '2026-11-12T10:00:00.000Z',
  items: [
    {
      productId: 'au-halden-nc',
      name: 'Halden NC Headphones',
      unitPriceCents: 27900,
      quantity: 2,
      lineTotalCents: 55800,
    },
  ],
}

const placedSummary: OrderSummaryData = {
  id: placedOrder.id,
  status: placedOrder.status,
  paymentMethod: placedOrder.paymentMethod,
  subtotalCents: placedOrder.subtotalCents,
  deliveryCents: placedOrder.deliveryCents,
  totalCents: placedOrder.totalCents,
  estimatedAt: placedOrder.estimatedAt,
  createdAt: '2026-11-10T09:00:00.000Z',
  itemCount: 1,
}

/** Answers the endpoints the screen's shell and query read: the account, the
    wish-list counter of the shell, and the order the screen asks for. */
const stubCassette = (order = placedOrder, summary = placedSummary) => {
  apiRequest.mockImplementation(async (path: string, options: { method?: string } = {}) => {
    const method = options.method ?? 'GET'
    if (path === '/me') return maya
    if (path === `/orders/${order.id}`) return order
    if (path === '/orders') return [summary]
    if (path === '/wishlist') return []
    if (path === '/cart') return { lines: [], subtotalCents: 0 } as CartData
    throw new Error(`unexpected API call: ${method} ${path}`)
  })
}

const renderScreen = async (at = '/checkout/confirmation?id=VC-20433', signedIn = true) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (signedIn) setToken('signed-in-token')

  const history = createMemoryHistory({ initialEntries: [at] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, queryClient }
}

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  apiRequest.mockReset()
})

describe('checkout-confirmation screen', () => {
  it('sends a guest to sign in, on their way back to the confirmation', async () => {
    stubCassette()
    const { router } = await renderScreen(undefined, false)
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    expect(router.state.location.search).toEqual({ next: '/checkout/confirmation?id=VC-20433' })
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('shows the confirmed order the id names, in the mockup order', async () => {
    stubCassette()
    await renderScreen()

    expect(await screen.findByRole('heading', { level: 1, name: 'Order confirmed' })).toBeVisible()
    expect(screen.getByText(/Thank you, Maya/)).toBeVisible()
    expect(screen.getByText('VC-20433')).toBeVisible()
    expect(screen.getByText('12 Nov 2026')).toBeVisible()

    // The summary keeps the order line and the money of the placed order.
    expect(screen.getByText('Halden NC Headphones')).toBeVisible()
    expect(screen.getByText('2 × €279.00')).toBeVisible()
    // Subtotal and line total are both €558.00 in the placed order.
    expect(screen.getAllByText('€558.00')).toHaveLength(2)
    expect(screen.getByText('€4.90')).toBeVisible()
    expect(screen.getByText('€562.90')).toBeVisible()

    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: 'View my orders' })).toHaveAttribute('href', '/orders')
  })

  it('opens the latest order still processing when it has no id', async () => {
    stubCassette()
    await renderScreen('/checkout/confirmation')

    expect(await screen.findByText(placedOrder.id)).toBeVisible()
    // The summary comes from the order that id resolved to, not the list.
    expect(screen.getByText('2 × €279.00')).toBeVisible()
  })

  it('shows the empty state when the account has no order on its way', async () => {
    stubCassette(placedOrder, { ...placedSummary, status: 'shipped' })
    await renderScreen('/checkout/confirmation')

    expect(await screen.findByText('No order to show')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Go to my orders' })).toHaveAttribute('href', '/orders')
  })

  it('keeps working when the order the id names is gone', async () => {
    apiRequest.mockImplementation(async (path: string, options: { method?: string } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/me') return maya
      if (path === '/orders' || path === '/wishlist') return []
      if (path === '/cart') return { lines: [], subtotalCents: 0 } as CartData
      if (path === `/orders/${placedOrder.id}`) throw new ApiError(404, 'Not found')
      throw new Error(`unexpected API call: ${method} ${path}`)
    })
    await renderScreen()

    expect(await screen.findByText('No order to show')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Go to my orders' })).toHaveAttribute('href', '/orders')
  })
})
