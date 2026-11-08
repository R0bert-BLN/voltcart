/**
 * Module 4 Wish list, end to end: the wish list screen and its flows —
 * getting there, adding rows to the cart, adding everything available,
 * removing with Undo and the empty state. Only the HTTP layer (`apiRequest`)
 * is stubbed, so the real query hooks, the real router and the real shell
 * are exercised.
 */
import type { CartData, WishlistItemData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getToken, setToken } from '@/api/client'
import { categories, products } from '@/lib/mock-data'
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

/** Maya's demo wish list, as the seeders have it: in stock, low stock, out. */
const wishlistItem = (productId: string, addedAt: string): WishlistItemData => {
  const product = products.find((candidate) => candidate.id === productId)!
  const category = categories.find((candidate) => candidate.id === product.categoryId)!
  return {
    productId,
    name: product.name,
    priceCents: product.price * 100,
    image: '',
    addedAt,
    stock: product.stock,
    categoryId: product.categoryId,
    categoryName: category.name,
  }
}

const halden = () => wishlistItem('au-halden-nc', '2026-10-20')
const vanta = () => wishlistItem('mn-vanta-34', '2026-10-25')
const ostra = () => wishlistItem('sh-ostra-cam', '2026-10-28')

/** Answers the module's endpoints the way the backend does, keeping the
    wish list and the cart in local state; anything else fails. */
const stubApi = (initial: WishlistItemData[], cartLines: CartData['lines'] = []) => {
  let wishlist = [...initial]
  // Where a removed item sat, so Undo can put it back in its place.
  const removedAt = new Map<string, number>()
  let cart: CartData = {
    lines: [...cartLines],
    subtotalCents: cartLines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  }

  apiRequest.mockImplementation(
    async (path: string, options: { method?: string; body?: unknown } = {}) => {
      const method = options.method ?? 'GET'
      if (path === '/me') return maya
      if (path === '/wishlist') return wishlist
      if (path === '/cart') return cart

      const wishMatch = path.match(/^\/wishlist\/([^/]+)$/)
      if (wishMatch && method === 'PUT') {
        const productId = decodeURIComponent(wishMatch[1])
        // An already-listed product keeps its place: the stored added_at wins.
        if (!wishlist.some((item) => item.productId === productId)) {
          const item = wishlistItem(productId, '2026-11-02')
          const at = removedAt.get(productId)
          removedAt.delete(productId)
          if (at === undefined) wishlist = [...wishlist, item]
          else wishlist = [...wishlist.slice(0, at), item, ...wishlist.slice(at)]
        }
        return wishlist.find((item) => item.productId === productId)
      }
      if (wishMatch && method === 'DELETE') {
        const productId = decodeURIComponent(wishMatch[1])
        removedAt.set(
          productId,
          wishlist.findIndex((item) => item.productId === productId),
        )
        wishlist = wishlist.filter((item) => item.productId !== productId)
        return undefined
      }

      const cartMatch = path.match(/^\/cart\/([^/]+)$/)
      if (cartMatch && method === 'PUT') {
        const productId = decodeURIComponent(cartMatch[1])
        const { quantity } = options.body as { quantity: number }
        // The backend caps the stored quantity at the product's stock.
        const capped = Math.min(quantity, products.find((p) => p.id === productId)!.stock)
        const lines = cart.lines.filter((line) => line.productId !== productId)
        const product = products.find((p) => p.id === productId)!
        if (capped > 0) {
          lines.push({
            productId,
            name: product.name,
            priceCents: product.price * 100,
            quantity: capped,
            lineTotalCents: product.price * 100 * capped,
            image: '',
          })
        }
        cart = {
          lines,
          subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
        }
        return cart
      }

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

/** The wish list section: its table, its rows live in here. */
const listSection = () => screen.getByRole('region', { name: 'Wish list' })

const rowOf = (name: string): HTMLElement => {
  const productId = products.find((product) => product.name === name)!.id
  return linkByHref(`/products/${productId}`).closest('tr') as HTMLElement
}

/** The newest toast: earlier ones may still be fading out. */
const toast = () => {
  const toasts = document.querySelectorAll('[data-slot="toast"]')
  return toasts[toasts.length - 1]
}

beforeEach(() => {
  localStorage.clear()
  apiRequest.mockReset()
})

describe('wish list flows', () => {
  it('walks every screen of the module in order, and back', async () => {
    stubApi([halden(), vanta(), ostra()])
    const { router } = await renderApp('/')
    await onScreen('Voltcart electronics store')

    // Into the module: the top bar's wish list counter.
    await userEvent.click(linkByHref('/wishlist'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/wishlist'))
    await onScreen('Wish list')
    expect(screen.getByText('3 items')).toBeVisible()
    expect(within(listSection()).getByText('Halden NC Headphones')).toBeVisible()
    expect(within(listSection()).getByText('Only 4 left')).toBeVisible()

    // On, out of the module: a product's name opens its product page.
    await userEvent.click(within(listSection()).getByRole('link', { name: 'Halden NC Headphones' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/products/au-halden-nc'))
    await onScreen('Halden NC Headphones')

    // And back: the browser returns to the same wish list.
    router.history.back()
    await waitFor(() => expect(router.state.location.pathname).toBe('/wishlist'))
    await onScreen('Wish list')

    // Out of the module and home: the brand.
    await userEvent.click(screen.getByRole('link', { name: 'Voltcart' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('adds a row to the cart and reports it, also when the stock allows no more', async () => {
    const api = stubApi(
      [halden(), vanta()],
      [
        {
          productId: 'mn-vanta-34',
          name: 'Vanta 34 Ultrawide Monitor',
          priceCents: 47900,
          quantity: 4,
          lineTotalCents: 191600,
          image: '',
        },
      ],
    )
    await renderApp('/wishlist')
    await onScreen('Wish list')

    // The in-stock row adds one unit and says so.
    await userEvent.click(
      within(rowOf('Halden NC Headphones')).getByRole('button', { name: 'Add to cart' }),
    )
    await waitFor(() => expect(toast()).toHaveTextContent('Added to your cart.'))
    expect(api.calls()).toContainEqual(['/cart/au-halden-nc', { method: 'PUT', body: { quantity: 1 } }])
    expect(screen.getByRole('link', { name: 'Cart, 2 items' })).toBeInTheDocument()

    // The row whose units are all in the cart adds nothing and says so.
    await userEvent.click(
      within(rowOf('Vanta 34 Ultrawide Monitor')).getByRole('button', { name: 'Add to cart' }),
    )
    await waitFor(() => expect(toast()).toHaveTextContent('No more units are available.'))
    expect(api.calls()).toContainEqual(['/cart/mn-vanta-34', { method: 'PUT', body: { quantity: 5 } }])
    // The capped write left the cart line at its stock of 4.
    expect(
      api
        .calls()
        .filter(([path, options]) => path === '/cart/mn-vanta-34' && options?.method === 'PUT'),
    ).toHaveLength(1)
  })

  it('adds every available item with "Add all available to cart" and skips the rest', async () => {
    const api = stubApi([halden(), vanta(), ostra()])
    await renderApp('/wishlist')
    await onScreen('Wish list')

    // The out-of-stock row is skipped: only the two available ones are added.
    await userEvent.click(screen.getByRole('button', { name: 'Add all available to cart' }))
    await waitFor(() => expect(toast()).toHaveTextContent('2 items added to your cart.'))
    expect(api.calls()).toContainEqual(['/cart/au-halden-nc', { method: 'PUT', body: { quantity: 1 } }])
    expect(api.calls()).toContainEqual(['/cart/mn-vanta-34', { method: 'PUT', body: { quantity: 1 } }])
    expect(api.calls().filter(([path]) => path === '/cart/sh-ostra-cam')).toHaveLength(0)
    expect(screen.getByRole('link', { name: 'Cart, 2 items' })).toBeInTheDocument()
  })

  it('removes a product at once and Undo puts it back', async () => {
    const api = stubApi([halden(), vanta(), ostra()])
    await renderApp('/wishlist')
    await onScreen('Wish list')
    expect(within(listSection()).getAllByRole('row')).toHaveLength(4)

    // The row leaves at once and the toast offers Undo.
    await userEvent.click(
      within(listSection()).getByRole('button', {
        name: 'Remove Vanta 34 Ultrawide Monitor from the wish list',
      }),
    )
    await waitFor(() => expect(toast()).toHaveTextContent('Vanta 34 Ultrawide Monitor removed.'))
    expect(screen.queryByText('Vanta 34 Ultrawide Monitor')).not.toBeInTheDocument()
    expect(screen.getByText('2 items')).toBeVisible()
    expect(api.calls()).toContainEqual(['/wishlist/mn-vanta-34', { method: 'DELETE' }])

    // Undo restores the product: the delete is never final.
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(screen.getByText('Vanta 34 Ultrawide Monitor')).toBeVisible())
    expect(screen.getByText('3 items')).toBeVisible()
    expect(api.calls()).toContainEqual(['/wishlist/mn-vanta-34', { method: 'PUT' }])
    expect(within(listSection()).getAllByRole('row')).toHaveLength(4)
  })

  it('emptying the list shows the empty state, which links back to the catalogue', async () => {
    stubApi([ostra()], [])
    const { router } = await renderApp('/wishlist')
    await onScreen('Wish list')

    // Nothing available: the bulk action cannot add anything.
    expect(screen.getByRole('button', { name: 'Add all available to cart' })).toBeDisabled()

    // The last remove empties the list into the empty state.
    await userEvent.click(
      within(listSection()).getByRole('button', {
        name: 'Remove Ostra Indoor Camera from the wish list',
      }),
    )
    await waitFor(() =>
      expect(within(listSection()).getByRole('heading', { name: 'Your wish list is empty' })).toBeVisible(),
    )
    expect(screen.queryByText('Add all available to cart')).not.toBeInTheDocument()

    // The empty state's action leads back into the catalogue.
    await userEvent.click(screen.getByRole('link', { name: 'Browse all products' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/products'))
    await onScreen('All products')
  })

  it('reads as an empty list for a guest, without asking the API', async () => {
    const api = stubApi([])
    await renderApp('/wishlist', false)
    await onScreen('Wish list')

    // No query runs without a token: the empty state stands in for the list.
    expect(within(listSection()).getByRole('heading', { name: 'Your wish list is empty' })).toBeVisible()
    expect(getToken()).toBeNull()
    expect(api.calls()).toHaveLength(0)
  })
})
