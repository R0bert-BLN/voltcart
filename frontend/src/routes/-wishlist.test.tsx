import type { CartData, UserData, WishlistItemData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setToken } from '@/api/client'
import { routeTree } from '@/routeTree.gen'

/**
 * The wish list screen against the real query hooks and the real router;
 * only the HTTP layer (`apiRequest`) is stubbed, statefully so a remove can
 * be undone and a capped add can be told apart from a real one.
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

const emptyCart: CartData = { lines: [], subtotalCents: 0 }

const halden: WishlistItemData = {
  productId: 'au-halden-nc',
  name: 'Halden NC Headphones',
  priceCents: 27900,
  image: 'products/au-halden-nc.jpg',
  addedAt: '2026-10-21T12:00:00Z',
  stock: 32,
  categoryId: 'audio',
  categoryName: 'Audio',
}
const vanta: WishlistItemData = {
  productId: 'mn-vanta-34',
  name: 'Vanta 34 Ultrawide Monitor',
  priceCents: 47900,
  image: 'products/mn-vanta-34.jpg',
  addedAt: '2026-10-27T12:00:00Z',
  stock: 4,
  categoryId: 'monitors',
  categoryName: 'Monitors',
}
const ostra: WishlistItemData = {
  productId: 'sh-ostra-cam',
  name: 'Ostra Indoor Camera',
  priceCents: 6900,
  image: 'products/sh-ostra-cam.jpg',
  addedAt: '2026-10-26T12:00:00Z',
  stock: 0,
  categoryId: 'smart-home',
  categoryName: 'Smart home',
}

/** Answers the app's endpoints the way the backend does; anything else fails. */
const stubApi = (wishlist: WishlistItemData[], cart: CartData = emptyCart) => {
  const products = new Map(wishlist.map((item) => [item.productId, item]))
  const removedIds = new Set<string>()
  let lines = [...cart.lines]

  apiRequest.mockImplementation(async (path: string, options: { method?: string; body?: unknown } = {}) => {
    const method = options.method ?? 'GET'

    if (path === '/me') return maya
    if (path === '/wishlist') {
      return wishlist.filter((item) => !removedIds.has(item.productId))
    }
    if (path === '/cart') {
      return { lines, subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0) }
    }

    const match = /^\/(wishlist|cart)\/([^/]+)$/.exec(path)
    if (match) {
      const [, base, productId] = match
      if (base === 'wishlist' && method === 'PUT') {
        removedIds.delete(productId)
        return products.get(productId)
      }
      if (base === 'wishlist' && method === 'DELETE') {
        removedIds.add(productId)
        return undefined
      }
      if (base === 'cart' && method === 'PUT') {
        // The stored quantity never exceeds the stock, as in the backend.
        const stock = products.get(productId)?.stock ?? 0
        const quantity = Math.min(Number((options.body as { quantity: number }).quantity), Math.max(stock, 0))
        lines = lines
          .filter((line) => line.productId !== productId && quantity >= 1)
          .concat(quantity >= 1 ? [{ productId, name: products.get(productId)?.name ?? '', priceCents: products.get(productId)?.priceCents ?? 0, quantity, lineTotalCents: quantity * (products.get(productId)?.priceCents ?? 0), image: products.get(productId)?.image ?? '' }] : [])
        return { lines, subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0) }
      }
    }

    throw new Error(`unexpected API call: ${method} ${path}`)
  })
}

const renderApp = async (signedIn = true) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(['me'], maya)
  if (signedIn) setToken('signed-in-token')
  const history = createMemoryHistory({ initialEntries: ['/wishlist'] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, queryClient }
}

const removeButton = (productName: string) =>
  screen.getByRole('button', { name: `Remove ${productName} from the wish list` })

/** Waits until the wish list has answered and its rows are on screen. */
const waitForRows = () => screen.findAllByRole('button', { name: 'Add to cart' })

beforeEach(() => {
  localStorage.clear()
  apiRequest.mockReset()
})

describe('wishlist screen', () => {
  it('heads the list with the item count and lists every product in order', async () => {
    stubApi([halden, vanta, ostra])
    await renderApp()

    expect(await screen.findByText('3 items')).toBeVisible()

    const table = screen.getByRole('table')
    const headers = [...table.querySelectorAll('th')].map((th) => th.textContent)
    expect(headers).toEqual(['Product', 'Price', 'Availability', 'Actions'])

    // One row per wish list item, in data order.
    const names = [...table.querySelectorAll('tbody tr')].map((row) =>
      row.querySelector<HTMLElement>('[data-slot="cell-product"]')?.textContent,
    )
    expect(names).toEqual([
      'Halden NC HeadphonesAudio',
      'Vanta 34 Ultrawide MonitorMonitors',
      'Ostra Indoor CameraSmart home',
    ])

    // The name links to the product page.
    expect(screen.getByRole('link', { name: 'Halden NC Headphones' })).toHaveAttribute(
      'href',
      '/products/au-halden-nc',
    )

    // Money from the data, stock from the data.
    expect(screen.getByText('€279.00')).toBeVisible()
    expect(screen.getByText('In stock')).toBeVisible()
    expect(document.querySelector('[data-stock="out"]')).toBeVisible()

    // The out-of-stock row cannot be added; the other two can.
    const addButtons = screen.getAllByRole('button', { name: 'Add to cart' })
    expect(addButtons).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Add all available to cart/ })).toBeEnabled()
  })

  it('adds a product to the cart and keeps it on the wish list', async () => {
    stubApi([halden, vanta])
    await renderApp()

    await userEvent.click((await waitForRows())[0])

    expect(apiRequest).toHaveBeenCalledWith('/cart/au-halden-nc', {
      method: 'PUT',
      body: { quantity: 1 },
    })
    await screen.findByText('Added to your cart.')
    // Adding keeps the item: every row is still there.
    expect(screen.getByText('2 items')).toBeVisible()
    expect(screen.getByRole('button', { name: `Remove ${halden.name} from the wish list` })).toBeVisible()
  })

  it('reports no more units when every unit is already in the cart', async () => {
    stubApi([halden], {
      lines: [{ productId: halden.productId, name: halden.name, priceCents: halden.priceCents, quantity: 32, lineTotalCents: 32 * halden.priceCents, image: halden.image }],
      subtotalCents: 32 * halden.priceCents,
    })
    await renderApp()
    // The cart lines must be in before the add, or the PUT would start from 0.
    await screen.findByRole('link', { name: 'Cart, 1 item' })
    await userEvent.click((await waitForRows())[0])

    await screen.findByText('No more units are available.')
  })

  it('adds every available product with the add-all button, skipping the out-of-stock one', async () => {
    stubApi([halden, vanta, ostra])
    await renderApp()
    await waitForRows()

    await userEvent.click(screen.getByRole('button', { name: /Add all available to cart/ }))

    expect(apiRequest).toHaveBeenCalledWith('/cart/au-halden-nc', {
      method: 'PUT',
      body: { quantity: 1 },
    })
    expect(apiRequest).toHaveBeenCalledWith('/cart/mn-vanta-34', {
      method: 'PUT',
      body: { quantity: 1 },
    })
    expect(apiRequest).not.toHaveBeenCalledWith('/cart/sh-ostra-cam', expect.anything())
    await screen.findByText('2 items added to your cart.')
    // The wish list itself is untouched.
    expect(screen.getByText('3 items')).toBeVisible()
  })

  it('removes a row with an Undo toast that puts it back', async () => {
    stubApi([halden, vanta])
    await renderApp()
    await waitForRows()

    await userEvent.click(removeButton(halden.name))

    // The row leaves at once and the toast offers Undo.
    expect(screen.queryByRole('link', { name: halden.name })).toBeNull()
    expect(screen.getByText('1 item')).toBeVisible()
    await screen.findByText('Halden NC Headphones removed.')

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => {
      // The undo puts the item back with a fresh PUT.
      expect(apiRequest).toHaveBeenCalledWith('/wishlist/au-halden-nc', { method: 'PUT' })
      expect(screen.getByRole('link', { name: halden.name })).toBeVisible()
      expect(screen.getByText('2 items')).toBeVisible()
    })
    // Focus returns to the restored row's Remove button.
    await waitFor(() => {
      expect(document.activeElement).toBe(removeButton(halden.name))
    })
  })

  it('keeps focus in the list when the removed row was the last one', async () => {
    stubApi([ostra])
    await renderApp()
    await screen.findByRole('table')

    await userEvent.click(removeButton(ostra.name))

    const link = await screen.findByRole('link', { name: 'Browse all products' })
    expect(link).toBeVisible()
    expect(screen.getByText('Your wish list is empty')).toBeVisible()
    await waitFor(() => {
      expect(document.activeElement).toBe(link)
    })
  })

  it('disables the add-all button when the wish list holds nothing in stock', async () => {
    stubApi([ostra])
    await renderApp()

    await waitFor(() => expect(screen.getByText('1 item')).toBeVisible())
    expect(screen.getByRole('button', { name: /Add all available to cart/ })).toBeDisabled()
  })

  it('shows the empty state without asking the API while the visitor is a guest', async () => {
    stubApi([])
    await renderApp(false)

    expect(screen.getByText('Your wish list is empty')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute(
      'href',
      '/products',
    )
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('shows a loading state while the wish list answers', async () => {
    // The wish list request never resolves; the screen waits for it.
    apiRequest.mockImplementation((path: string) => {
      if (path === '/me') return maya
      if (path === '/cart') return emptyCart
      return new Promise(() => {})
    })
    await renderApp()

    expect(screen.getByText('Loading your wish list')).toBeVisible()
  })
})
