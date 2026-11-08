import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { routeTree } from '@/routeTree.gen'

/**
 * Boots the real route tree at `path` in a memory history and returns the
 * router (for the router state after a navigation) and the test container.
 */
const renderRoute = async (path: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, container: view.container }
}

beforeEach(() => {
  localStorage.clear()
})

describe('store shell', () => {
  it('shows the brand, the catalogue section, the search field and the counters', async () => {
    await renderRoute('/')

    // Scoped to the top bar: the store home now carries an "All products"
    // link of its own.
    const topBar = within(screen.getByRole('banner'))
    expect(screen.getByRole('link', { name: 'Voltcart' })).toBeVisible()
    expect(topBar.getByRole('link', { name: 'All products' })).toBeVisible()
    expect(screen.getByRole('searchbox', { name: 'Search products' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Wish list' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Cart' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Account' })).toBeVisible()
  })

  it('shows no counter badges while the counts are zero', async () => {
    const { container } = await renderRoute('/')

    expect(container.querySelector('[data-slot="count"]')).toBeNull()
  })

  it('offers sign in and create account to a guest', async () => {
    await renderRoute('/')

    await userEvent.click(screen.getByRole('button', { name: 'Account' }))

    expect(screen.getByRole('menuitem', { name: 'Sign in' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Create account' })).toBeVisible()
  })

  it('searches from the top bar on the product list', async () => {
    const { router } = await renderRoute('/')

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search products' }), 'lamp{Enter}')

    await waitFor(() => expect(router.state.location.pathname).toBe('/products'))
    expect(router.state.location.search.q).toBe('lamp')
  })
})

describe('admin sidebar', () => {
  it('replaces the top bar and highlights the current section', async () => {
    const { container } = await renderRoute('/admin/products')

    expect(container.querySelector('[data-slot="top-bar"]')).toBeNull()
    expect(screen.getByRole('link', { name: 'Overview' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Products' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('auth screens', () => {
  it('carry only the brand, no top bar and no sidebar', async () => {
    const { container } = await renderRoute('/login')

    expect(container.querySelector('[data-slot="top-bar"]')).toBeNull()
    expect(container.querySelector('[data-slot="admin-sidebar"]')).toBeNull()
    expect(screen.getByRole('link', { name: 'Voltcart' })).toBeVisible()
  })
})

describe('placeholder screens', () => {
  // The wish list (T44) and the cart (T46) are built screens; the remaining
  // placeholders are the checkout and orders screens of the later reports.
  it.each([
    ['/checkout/details', 'Delivery and payment'],
    ['/checkout/review', 'Review order'],
    ['/checkout/confirmation', 'Order confirmed'],
    ['/orders', 'Order history'],
    ['/orders/o1', 'Order details'],
  ])('%s shows its placeholder with a way back', async (path, title) => {
    await renderRoute(path)

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Go back' })).toBeVisible()
  })

  it('goes back through the history when the placeholder button is used', async () => {
    const { router } = await renderRoute('/')
    // A placeholder screen keeps its way back through the history.
    await router.navigate({ to: '/orders' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/orders'))

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
