/**
 * Module 2 Catalogue, end to end: store home, product list and product
 * details. The catalogue reads the local data and a signed-out visitor keeps
 * the account queries off, so the real route tree and shell run here without
 * an API stub.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { products } from '@/lib/mock-data'
import { routeTree } from '@/routeTree.gen'

const renderApp = async (path: string) => {
  // Like the app: a fresh query client per session.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
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

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** The first link with this href; throws a readable error when missing. */
const linkByHref = (href: string): HTMLElement => {
  const link = document.querySelector(`a[href="${href}"]`)
  if (!(link instanceof HTMLElement)) throw new Error(`no link to ${href}`)
  return link
}

beforeEach(() => {
  localStorage.clear()
})

describe('catalogue flows', () => {
  it('walks every screen of the module in order, and back', async () => {
    const { router } = await renderApp('/')

    // Into the module: a category tile of the home carousel.
    await userEvent.click(linkByHref('/products?category=laptops'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/products'))
    const laptops = products.filter((product) => product.categoryId === 'laptops')
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Laptops' })).toBeVisible()
      expect(screen.getByText(plural(laptops.length, 'product'))).toBeVisible()
    })

    // On to the product screen: a card's name link.
    await userEvent.click(screen.getByRole('link', { name: 'Aster Air 14 Laptop' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/products/lp-aster-14'))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Aster Air 14 Laptop' })).toBeVisible(),
    )

    // Back one screen: the product's category link returns to the same list.
    await userEvent.click(
      within(screen.getByRole('region', { name: 'Product information' })).getByRole('link', {
        name: 'Laptops',
      }),
    )
    await waitFor(() => expect(router.state.location.pathname).toBe('/products'))
    expect(router.state.location.search).toEqual({ category: 'laptops' })

    // Out of the module and home: the brand.
    await userEvent.click(screen.getByRole('link', { name: 'Voltcart' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('searches from the top bar and Back returns to the same results', async () => {
    const { router } = await renderApp('/')
    const found = products.filter((product) =>
      `${product.name} ${product.description}`.toLowerCase().includes('corvo'),
    )

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search products' }), 'corvo{Enter}')
    await waitFor(() => expect(router.state.location.pathname).toBe('/products'))
    expect(router.state.location.search).toEqual({ q: 'corvo' })
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Search results' })).toBeVisible(),
    )
    expect(screen.getByText(`${plural(found.length, 'product')} for "corvo"`)).toBeVisible()

    // A result opens the product screen.
    await userEvent.click(screen.getByRole('link', { name: 'Corvo 6 Smartphone' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/products/ph-corvo-6'))

    // Back returns to the same results, search text and all.
    router.history.back()
    await waitFor(() => expect(router.state.location.pathname).toBe('/products'))
    expect(router.state.location.search).toEqual({ q: 'corvo' })
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Search results' })).toBeVisible(),
    )
    expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveValue('corvo')
  })

  it('narrows the list with filters in place, shows the empty state and clears it', async () => {
    const { router } = await renderApp('/products')
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'All products' })).toBeVisible(),
    )
    await waitFor(() => expect(screen.getByText(plural(products.length, 'product'))).toBeVisible())

    // Two filters combine into no results: laptops under €100.
    await userEvent.click(screen.getByRole('checkbox', { name: /^Laptops/ }))
    await userEvent.type(document.querySelector('input[name="max"]')!, '100')

    // The counts and the address update without leaving the page.
    expect(router.state.location.pathname).toBe('/products')
    expect(router.state.location.search).toEqual({ category: 'laptops', max: '100' })
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'No products match' })).toBeVisible(),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    // Clear filters restores the whole catalogue.
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'All products' })).toBeVisible(),
    )
    expect(router.state.location.search).toEqual({})
    await waitFor(() => expect(screen.getByText(plural(products.length, 'product'))).toBeVisible())
  })
})
