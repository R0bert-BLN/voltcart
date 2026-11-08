import type { CartData, OrderData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, setToken } from '@/api/client'
import { routeTree } from '@/routeTree.gen'

/**
 * The order details screen against the real query hooks, the real router and
 * the real shell; only the HTTP layer (`apiRequest`) is stubbed.
 */
const apiRequest = vi.hoisted(() => vi.fn())

vi.mock('@/api/client', async (importOriginal) => {
  const actual = importOriginal<typeof import('@/api/client')>()
  return { ...(await actual), apiRequest }
})

const maya = { id: 1, role: 'client', name: 'Maya Keller', email: 'maya.keller@example.com', phone: null }

const order: OrderData = {
  id: 'VC-20433',
  status: 'processing',
  paymentMethod: 'card',
  subtotalCents: 83700,
  deliveryCents: 490,
  totalCents: 84190,
  estimatedAt: '2026-11-13T10:00:00.000Z',
  createdAt: '2026-11-10T09:00:00.000Z',
  contactName: 'Maya Keller',
  contactPhone: '+49 30 123456',
  addressLine1: 'Torstraße 140',
  postalCode: '10119',
  city: 'Berlin',
  country: 'Germany',
  deliveryMethodName: 'Courier',
  deliveryMethodDays: 3,
  items: [
    {
      productId: 'au-halden-nc',
      name: 'Halden NC Headphones',
      unitPriceCents: 27900,
      quantity: 2,
      lineTotalCents: 55800,
    },
    {
      productId: 'chg-solfast-45',
      name: 'Solfast 45W Charger',
      unitPriceCents: 27900,
      quantity: 1,
      lineTotalCents: 27900,
    },
  ],
}

const history = [
  {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    subtotalCents: order.subtotalCents,
    deliveryCents: order.deliveryCents,
    totalCents: order.totalCents,
    estimatedAt: order.estimatedAt,
    createdAt: order.createdAt,
    itemCount: 3,
  },
]

const emptyCart: CartData = { lines: [], subtotalCents: 0 }

/** Answers the endpoints the screen's shell and queries read: the account, the
    wish-list counter of the shell, the cart, and the order the screen asks for. */
const stubCassette = (thisOrder: typeof order = order) => {
  apiRequest.mockImplementation(async (path: string, options: { method?: string } = {}) => {
    const method = options.method ?? 'GET'
    if (path === '/me') return maya
    if (path === `/orders/${thisOrder.id}`) return thisOrder
    if (path === '/orders') return history
    if (path === '/wishlist') return []
    if (path === '/cart' && method === 'GET') return emptyCart
    throw new Error(`unexpected API call: ${method} ${path}`)
  })
}

const renderScreen = async (at = '/orders/VC-20433', signedIn = true) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (signedIn) setToken('signed-in-token')

  const memory = createMemoryHistory({ initialEntries: [at] })
  const router = createRouter({ routeTree, history: memory, context: { queryClient } })
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

describe('orders-detail screen', () => {
  it('sends a guest to sign in, on their way back to the order', async () => {
    stubCassette()
    const { router } = await renderScreen(undefined, false)
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    expect(router.state.location.search).toEqual({ next: '/orders/VC-20433' })
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('shows the order the id names, in the mockup order', async () => {
    stubCassette()
    await renderScreen()

    expect(await screen.findByRole('heading', { level: 1, name: 'Order VC-20433' })).toBeVisible()
    expect(screen.getByText('Placed 10 Nov 2026 · 3 items')).toBeVisible()

    // The trail names the history the screen came from.
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('My orders')

    // The items and their money.
    expect(screen.getByText('Halden NC Headphones')).toBeVisible()
    expect(screen.getByText('2 × €279.00')).toBeVisible()
    expect(screen.getByText('Solfast 45W Charger')).toBeVisible()
    expect(screen.getByText('€837.00')).toBeVisible()
    expect(screen.getByText('€4.90')).toBeVisible()
    expect(screen.getByText('€841.90')).toBeVisible()

    // Delivery address, and delivery and payment: the paragraphs mix several
    // text nodes, so the block carries the words.
    expect(screen.getByRole('heading', { level: 2, name: 'Delivery address' })).toBeVisible()
    const addressBlock = screen.getByText('Maya Keller').closest('[data-slot="address-block"]')
    expect(addressBlock).toHaveTextContent('Torstraße 140')
    expect(addressBlock).toHaveTextContent('Berlin 10119')
    expect(addressBlock).toHaveTextContent('Germany')
    expect(screen.getByRole('heading', { level: 2, name: 'Delivery and payment' })).toBeVisible()
    const deliveryBlock = screen.getByText('Courier').closest('[data-slot="address-block"]')
    expect(deliveryBlock).toHaveTextContent('Card')
    expect(deliveryBlock).toHaveTextContent('3 days · €4.90')

    // The status card: badge and the processing timeline.
    expect(screen.getByRole('heading', { level: 2, name: 'Status' })).toBeVisible()
    expect(screen.getByText('Processing')).toBeVisible()
    expect(screen.getByText('Order placed')).toBeVisible()
    expect(screen.getByText('Not yet')).toBeVisible()
    expect(screen.getAllByText('Estimated 13 Nov 2026').length).toBeGreaterThan(0)

    expect(screen.getByRole('button', { name: 'Buy again' })).toBeVisible()
  })

  it('shows the not-found state when the id names no order of this account', async () => {
    apiRequest.mockImplementation(async (path: string, options: { method?: string } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/me') return maya
      if (path === '/wishlist') return []
      if (path === '/cart') return emptyCart
      if (path === `/orders/${order.id}`) throw new ApiError(404, 'Not found')
      throw new Error(`unexpected API call: ${method} ${path}`)
    })
    await renderScreen()

    expect(await screen.findByText('This order could not be found')).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Back to my orders' }),
    ).toHaveAttribute('href', '/orders')
  })

  it('stops a cancelled order at the cancellation', async () => {
    stubCassette({ ...order, status: 'cancelled', estimatedAt: null })
    await renderScreen()

    // The badge and the timeline step both carry the status.
    expect((await screen.findAllByText('Cancelled')).length).toBeGreaterThan(0)
    expect(screen.queryByText('Not yet')).not.toBeInTheDocument()
  })

  it('buy again puts every item back at its ordered quantity and opens the cart', async () => {
    stubCassette()
    apiRequest.mockImplementation(async (path: string, options: { method?: string; body?: unknown } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/me') return maya
      if (path === `/orders/${order.id}`) return order
      if (path === '/orders') return history
      if (path === '/wishlist') return []
      if (path === '/cart' && method === 'GET') return emptyCart
      const quantity = (options.body as { quantity: number }).quantity
      if (path === '/cart/au-halden-nc' && method === 'PUT' && quantity === 2) {
        return {
          lines: [
            { productId: 'au-halden-nc', name: 'Halden NC Headphones', priceCents: 27900, quantity: 2, lineTotalCents: 55800, image: 'product.png' },
          ],
          subtotalCents: 55800,
        } as CartData
      }
      if (path === '/cart/chg-solfast-45' && method === 'PUT' && quantity === 1) {
        return {
          lines: [
            { productId: 'au-halden-nc', name: 'Halden NC Headphones', priceCents: 27900, quantity: 2, lineTotalCents: 55800, image: 'product.png' },
            { productId: 'chg-solfast-45', name: 'Solfast 45W Charger', priceCents: 27900, quantity: 1, lineTotalCents: 27900, image: 'product.png' },
          ],
          subtotalCents: 83700,
        } as CartData
      }
      throw new Error(`unexpected API call: ${method} ${path}${quantity === undefined ? '' : ` (quantity ${quantity})`}`)
    })
    const { router } = await renderScreen()

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Buy again' }))

    // Both lines were requested at their ordered quantity, on top of nothing.
    await waitFor(() => expect(router.state.location.pathname).toBe('/cart'))
    expect(apiRequest).toHaveBeenCalledWith('/cart/au-halden-nc', { method: 'PUT', body: { quantity: 2 } })
    expect(apiRequest).toHaveBeenCalledWith('/cart/chg-solfast-45', { method: 'PUT', body: { quantity: 1 } })
    expect(await screen.findByText('2 products added to your cart.')).toBeVisible()
  })

  it('counts a line the stock held back as skipped when buying again', async () => {
    stubCassette()
    // The cart already holds the full stock of the second item.
    const heldCart: CartData = {
      lines: [
        { productId: 'chg-solfast-45', name: 'Solfast 45W Charger', priceCents: 27900, quantity: 1, lineTotalCents: 27900, image: 'product.png' },
      ],
      subtotalCents: 27900,
    }
    apiRequest.mockImplementation(async (path: string, options: { method?: string; body?: unknown } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/me') return maya
      if (path === `/orders/${order.id}`) return order
      if (path === '/orders') return history
      if (path === '/wishlist') return []
      if (path === '/cart' && method === 'GET') return heldCart
      const body = options.body as { quantity: number } | undefined
      // The backend caps at the stock: the first line fits, the second stays.
      if (path === '/cart/au-halden-nc' && method === 'PUT') {
        return {
          lines: [...heldCart.lines, { productId: 'au-halden-nc', name: 'Halden NC Headphones', priceCents: 27900, quantity: 2, lineTotalCents: 55800, image: 'product.png' }],
          subtotalCents: 83700,
        } as CartData
      }
      if (path === '/cart/chg-solfast-45' && method === 'PUT' && body?.quantity === 2) {
        return {
          lines: [...heldCart.lines, { productId: 'au-halden-nc', name: 'Halden NC Headphones', priceCents: 27900, quantity: 2, lineTotalCents: 55800, image: 'product.png' }],
          subtotalCents: 83700,
        } as CartData
      }
      throw new Error(`unexpected API call: ${method} ${path}`)
    })
    const { router } = await renderScreen()

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Buy again' }))

    // The still-stockable line went into the cart and the cart opens; the toast
    // names the line the stock held back.
    await waitFor(() => expect(router.state.location.pathname).toBe('/cart'))
    expect(await screen.findByText('1 product added to your cart. 1 item could not be added.')).toBeVisible()
  })

  it('shows the toast of the mockup when nothing could be added', async () => {
    stubCassette()
    // Both lines are fully in the cart already, at or over their ordered quantity.
    const heldCart: CartData = {
      lines: [
        { productId: 'au-halden-nc', name: 'Halden NC Headphones', priceCents: 27900, quantity: 2, lineTotalCents: 55800, image: 'product.png' },
        { productId: 'chg-solfast-45', name: 'Solfast 45W Charger', priceCents: 27900, quantity: 1, lineTotalCents: 27900, image: 'product.png' },
      ],
      subtotalCents: 83700,
    }
    apiRequest.mockImplementation(async (path: string, options: { method?: string; body?: unknown } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/me') return maya
      if (path === `/orders/${order.id}`) return order
      if (path === '/orders') return history
      if (path === '/wishlist') return []
      if (path === '/cart' && method === 'GET') return heldCart
      // Each PUT asks for the ordered quantity on top of the held one, and the
      // stock-capped answer carries the held quantity back for both lines.
      if (method === 'PUT') {
        return heldCart
      }
      throw new Error(`unexpected API call: ${method} ${path}`)
    })
    await renderScreen()

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Buy again' }))

    // Each PUT drives the line at its ordered quantity and the answer carries
    // the held quantity back, so both lines count as skipped.
    expect(await screen.findByText(/None of these items can be added/)).toBeVisible()
  })
})
