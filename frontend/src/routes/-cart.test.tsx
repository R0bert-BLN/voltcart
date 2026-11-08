import type { CartData, CartLineData, UserData, WishlistItemData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setToken } from '@/api/client'
import { routeTree } from '@/routeTree.gen'

/**
 * The cart screen against the real query hooks and the real router; only the
 * HTTP layer (`apiRequest`) is stubbed, statefully so a quantity write and a
 * remove change the cart that the next read answers with.
 */
const apiRequest = vi.hoisted(() => vi.fn())

vi.mock('@/api/client', async (importOriginal) => {
  const actual = importOriginal<typeof import('@/api/client')>()
  return { ...(await actual), apiRequest }
})

const maya: UserData = {
  id: 1,
  role: 'client',
  name: 'Maya Keller',
  email: 'maya.keller@example.com',
  phone: null,
}

const halden: CartLineData = {
  productId: 'au-halden-nc',
  name: 'Halden NC Headphones',
  priceCents: 27900,
  quantity: 2,
  lineTotalCents: 55800,
  image: 'products/au-halden-nc.jpg',
}
// Stock 3 in the catalogue: with quantity 3 the stepper has hit its ceiling.
const fernbook: CartLineData = {
  productId: 'lp-fernbook-13',
  name: 'Fernbook 13 Laptop',
  priceCents: 64900,
  quantity: 3,
  lineTotalCents: 194700,
  image: 'products/lp-fernbook-13.jpg',
}

/** Answers the app's endpoints the way the backend does; anything else fails. */
const stubApi = (cart: CartData) => {
  let current = cart
  const recalc = (lines: CartLineData[]): CartData => ({
    lines,
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  })

  apiRequest.mockImplementation(async (path: string, options: { method?: string; body?: unknown } = {}) => {
    const method = options.method ?? 'GET'
    if (path === '/me') return maya
    if (path === '/cart' && method === 'GET') return current
    if (path === '/wishlist') return []

    const match = /^\/(cart|wishlist)\/([^/]+)$/.exec(path)
    if (match) {
      const [, base, productId] = match
      const line = current.lines.find((candidate) => candidate.productId === productId)

      if (base === 'wishlist' && method === 'PUT') {
        const item: WishlistItemData = {
          productId,
          name: line?.name ?? '',
          priceCents: line?.priceCents ?? 0,
          image: line?.image ?? '',
          addedAt: '2026-11-01T12:00:00Z',
          stock: 32,
          categoryId: 'audio',
          categoryName: 'Audio',
        }
        return item
      }

      if (base === 'cart' && method === 'PUT') {
        // The backend keeps the quantity as written in this stub.
        const quantity = Number((options.body as { quantity: number }).quantity)
        current = recalc(
          current.lines.map((candidate) =>
            candidate.productId === productId
              ? { ...candidate, quantity, lineTotalCents: candidate.priceCents * quantity }
              : candidate,
          ),
        )
        return current
      }

      if (method === 'DELETE') {
        current = recalc(current.lines.filter((candidate) => candidate.productId !== productId))
        return undefined
      }
    }

    throw new Error(`unexpected API call: ${method} ${path}`)
  })
}

const renderApp = async (signedIn = true) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (signedIn) {
    setToken('signed-in-token')
    queryClient.setQueryData(['me'], maya)
  }
  const history = createMemoryHistory({ initialEntries: ['/cart'] })
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

beforeEach(() => {
  localStorage.clear()
  apiRequest.mockReset()
})

describe('cart screen', () => {
  it('heads the cart with the item count and rows with prices and totals', async () => {
    stubApi({ lines: [halden, fernbook], subtotalCents: halden.lineTotalCents + fernbook.lineTotalCents })
    await renderApp()

    expect(await screen.findByRole('heading', { name: 'Your cart' })).toBeVisible()
    expect(screen.getByText('2 items')).toBeVisible()

    // One row per line, in data order.
    const rows = [...screen.getByRole('table').querySelectorAll('tbody tr')]
    const names = rows.map((row) => row.querySelector<HTMLElement>('[data-slot="cell-product"]')?.textContent)
    expect(names[0]).toContain('Halden NC Headphones')
    expect(names[1]).toContain('Fernbook 13 Laptop')
    expect(screen.getByText('€279.00')).toBeVisible()
    expect(screen.getByText('€558.00')).toBeVisible()

    // The steppers read the line quantities.
    expect(screen.getByRole('spinbutton', { name: 'Quantity of Halden NC Headphones' })).toHaveValue(2)
    expect(screen.getByRole('spinbutton', { name: 'Quantity of Fernbook 13 Laptop' })).toHaveValue(3)
  })

  it('shows the order summary with the delivery estimate and the links onward', async () => {
    stubApi({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderApp()

    await screen.findByRole('heading', { name: 'Order summary' })
    expect(summary().getByText('€558.00')).toBeVisible()
    expect(summary().getByText('Estimated delivery')).toBeVisible()
    expect(summary().getByText('€4.90')).toBeVisible()
    expect(summary().getByText('€562.90')).toBeVisible()
    expect(summary().getByRole('link', { name: 'Continue to checkout' })).toHaveAttribute(
      'href',
      '/checkout/details',
    )
    expect(summary().getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/products')
  })

  it('writes a new quantity through the stepper and the summary follows', async () => {
    stubApi({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderApp()
    await screen.findByRole('table')

    await userEvent.click(screen.getByRole('button', { name: 'Increase' }))

    expect(apiRequest).toHaveBeenCalledWith('/cart/au-halden-nc', {
      method: 'PUT',
      body: { quantity: 3 },
    })
    // 3 × €279.00 plus the €4.90 delivery estimate.
    await waitFor(() => expect(summary().getByText('€841.90')).toBeVisible())

    // One unit is the floor: at 1 the decrease button is off.
    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }))
    await waitFor(() => expect(screen.getByRole('spinbutton', { name: /Halden/ })).toHaveValue(2))
    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }))
    await waitFor(() => expect(screen.getByRole('spinbutton', { name: /Halden/ })).toHaveValue(1))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled())
  })

  it('stops the stepper at the available stock', async () => {
    stubApi({ lines: [halden, fernbook], subtotalCents: halden.lineTotalCents + fernbook.lineTotalCents })
    await renderApp()
    await screen.findByRole('table')

    // The laptop's three units are all in the cart: its stepper is capped.
    const increaseButtons = screen.getAllByRole('button', { name: 'Increase' })
    expect(increaseButtons[0]).toBeEnabled()
    expect(increaseButtons[1]).toBeDisabled()
  })

  it('removes a line and confirms it with a toast', async () => {
    stubApi({ lines: [halden, fernbook], subtotalCents: halden.lineTotalCents + fernbook.lineTotalCents })
    await renderApp()
    await screen.findByRole('table')

    await userEvent.click(screen.getByRole('button', { name: 'Remove Halden NC Headphones from the cart' }))

    expect(apiRequest).toHaveBeenCalledWith('/cart/au-halden-nc', { method: 'DELETE' })
    await screen.findByText('Halden NC Headphones removed from your cart.')
    await waitFor(() => expect(screen.getByText('1 item')).toBeVisible())
  })

  it('moves a line to the wish list and out of the cart', async () => {
    stubApi({ lines: [halden], subtotalCents: halden.lineTotalCents })
    await renderApp()
    await screen.findByRole('table')

    await userEvent.click(screen.getByRole('button', { name: 'Move to wish list' }))

    expect(apiRequest).toHaveBeenCalledWith('/wishlist/au-halden-nc', { method: 'PUT' })
    expect(apiRequest).toHaveBeenCalledWith('/cart/au-halden-nc', { method: 'DELETE' })
    await screen.findByText('Halden NC Headphones moved to your wish list.')
    await screen.findByText('Your cart is empty')
  })

  it('shows the empty state when the cart holds nothing', async () => {
    stubApi({ lines: [], subtotalCents: 0 })
    await renderApp()

    expect(await screen.findByText('Your cart is empty')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute('href', '/products')
  })

  it('shows an empty cart to a guest without asking the API', async () => {
    stubApi({ lines: [], subtotalCents: 0 })
    await renderApp(false)

    expect(await screen.findByText('Your cart is empty')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute('href', '/products')
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('shows a loading state while the cart answers', async () => {
    // The cart request never resolves; the screen waits for it.
    apiRequest.mockImplementation((path: string) => {
      if (path === '/me') return maya
      if (path === '/wishlist') return []
      return new Promise(() => {})
    })
    await renderApp()

    expect(screen.getByText('Loading your cart')).toBeVisible()
  })
})
