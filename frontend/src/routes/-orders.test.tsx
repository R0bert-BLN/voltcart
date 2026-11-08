import type { CartData, OrderSummaryData, UserData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setToken } from '@/api/client'
import { routeTree } from '@/routeTree.gen'

/**
 * The order history screen against the real query hooks and the real router;
 * only the HTTP layer (`apiRequest`) is stubbed.
 */
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

const summary = (
  id: string,
  status: OrderSummaryData['status'],
  createdAt: string,
  itemCount = 2,
): OrderSummaryData => ({
  id,
  status,
  paymentMethod: 'card',
  subtotalCents: 44900,
  deliveryCents: 490,
  totalCents: 45390,
  estimatedAt: '2026-11-20T12:00:00.000Z',
  createdAt,
  itemCount,
})

const processing = summary('VC-20433', 'processing', '2026-11-10T09:00:00.000Z')
const shipped = summary('VC-20381', 'shipped', '2026-10-28T14:30:00.000Z', 1)
const delivered = summary('VC-20190', 'delivered', '2026-10-02T11:00:00.000Z', 3)

/** Answers the endpoints the screen and its shell read, the way the backend
    does; anything else fails. */
const stubApi = (orders: OrderSummaryData[]) => {
  apiRequest.mockImplementation(async (path: string) => {
    if (path === '/me') return maya
    if (path === '/orders') return orders
    if (path === '/wishlist') return []
    if (path === '/cart') return { lines: [], subtotalCents: 0 } as CartData
    throw new Error(`unexpected API call: ${path}`)
  })
}

const renderApp = async (at = '/orders', signedIn = true) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(['me'], maya)
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

/** Waits until the orders have answered and the table is on screen. */
const waitForTable = () => screen.findByRole('table')

beforeEach(() => {
  localStorage.clear()
  apiRequest.mockReset()
})

describe('order history screen', () => {
  it('sends a guest to sign in, on their way back to the history', async () => {
    stubApi([])
    const { router } = await renderApp('/orders', false)
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    expect(router.state.location.search).toEqual({ next: '/orders' })
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('heads the history with the order count and lists every order in data order', async () => {
    stubApi([processing, shipped, delivered])
    await renderApp()

    expect(await screen.findByText('3 orders')).toBeVisible()

    const table = await waitForTable()
    const headers = [...table.querySelectorAll('th')].map((th) => th.textContent)
    expect(headers).toEqual(['Order', 'Date', 'Items', 'Total', 'Status', 'Details'])

    // One row per order, newest first, with the data of each order summary.
    const rows = [...table.querySelectorAll('tbody tr')]
    expect(rows.map((row) => row.getAttribute('data-id'))).toEqual([
      'VC-20433',
      'VC-20381',
      'VC-20190',
    ])
    const firstRow = rows[0]
    expect(firstRow).toHaveTextContent('10 Nov 2026')
    expect(firstRow).toHaveTextContent('2')
    expect(firstRow).toHaveTextContent('€453.90')
    expect(firstRow).toHaveTextContent('Processing')

    // The order number links to the details screen.
    expect(screen.getByRole('link', { name: 'VC-20433' })).toHaveAttribute(
      'href',
      '/orders/VC-20433',
    )

    // The status badge names every present state.
    expect(within(table).getByText('Shipped')).toBeVisible()
    expect(within(table).getByText('Delivered')).toBeVisible()
  })

  it('links each row to the order details with an accessible name', async () => {
    stubApi([processing])
    await renderApp()

    await waitForTable()
    const link = screen.getByRole('link', { name: 'View details of order VC-20433' })
    expect(link).toHaveAttribute('href', '/orders/VC-20433')
  })

  it('filters the rows by status and keeps the choice in the address', async () => {
    stubApi([processing, shipped, delivered])
    const { router } = await renderApp()

    const table = await waitForTable()
    expect(screen.getByRole('button', { name: 'All' })).toBeVisible()
    expect(table.querySelectorAll('tbody tr')).toHaveLength(3)

    await userEvent.click(screen.getByRole('button', { name: 'Shipped' }))

    // One row of the three stays, and the address carries the filter.
    await waitFor(() => {
      expect(table.querySelectorAll('tbody tr')).toHaveLength(1)
    })
    expect(router.state.location.search).toEqual({ status: 'shipped' })
    expect(screen.getByRole('button', { name: 'Shipped' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reads the filter back from the address when the screen opens on a link', async () => {
    stubApi([processing, shipped, delivered])
    await renderApp('/orders?status=delivered')

    await waitForTable()
    expect(screen.getByRole('button', { name: 'Delivered' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const table = screen.getByRole('table')
    expect(table.querySelectorAll('tbody tr')).toHaveLength(1)
  })

  it('shows the filter empty state when a status has no orders', async () => {
    stubApi([processing, shipped])
    await renderApp('/orders?status=cancelled', true)

    await screen.findByText('No cancelled orders')
    expect(screen.getByText('Choose another status to see your other orders.')).toBeVisible()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('returns to every order when the All chip is chosen again', async () => {
    stubApi([processing, shipped])
    const { router } = await renderApp('/orders?status=shipped')

    await waitForTable()
    await userEvent.click(screen.getByRole('button', { name: 'All' }))

    const table = await screen.findByRole('table')
    await waitFor(() => {
      expect(table.querySelectorAll('tbody tr')).toHaveLength(2)
    })
    expect(router.state.location.search).toEqual({})
  })

  it('shows the empty state for an account without orders', async () => {
    stubApi([])
    await renderApp()

    expect(await screen.findByText('You have no orders yet')).toBeVisible()
    expect(
      screen.getByText('Your orders appear here once you place them.'),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute(
      'href',
      '/products',
    )
    expect(screen.queryByRole('group', { name: 'Filter by status' })).toBeNull()
  })

  it('shows a loading state while the history answers', async () => {
    stubApi([])
    apiRequest.mockImplementation((path: string) => {
      if (path === '/me') return maya
      if (path === '/wishlist') return []
      if (path === '/cart') return { lines: [], subtotalCents: 0 } as CartData
      return new Promise(() => {})
    })
    await renderApp()

    expect(screen.getByText('Loading your orders')).toBeVisible()
  })

  it('shows an error state when the history fails to load', async () => {
    stubApi([])
    apiRequest.mockImplementation(async (path: string) => {
      if (path === '/me') return maya
      if (path === '/wishlist') return []
      if (path === '/cart') return { lines: [], subtotalCents: 0 } as CartData
      throw new Error('network down')
    })
    await renderApp()

    expect(await screen.findByText('Loading your orders failed')).toBeVisible()
    expect(screen.getByText('The list did not come through. Try again in a moment.')).toBeVisible()
  })
})
