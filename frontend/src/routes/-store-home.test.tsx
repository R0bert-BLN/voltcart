import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { categories, deliveryMethods, products } from '@/lib/mock-data'
import { routeTree } from '@/routeTree.gen'

/** Renders the route through the real router so the links are exercised.
    Without a token the cart, wish list and account queries stay disabled, so
    no API stub is needed. */
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

const categoryCount = (id: string) => products.filter((product) => product.categoryId === id).length
const popularNames = products.filter((product) => product.popular).slice(0, 8).map((p) => p.name)

beforeEach(() => {
  localStorage.clear()
})

describe('catalog-home screen', () => {
  it('shows the category carousel, the popular products and the delivery strip, in order', async () => {
    const { container } = await renderRoute('/')

    expect(screen.getByRole('heading', { level: 1, name: 'Voltcart electronics store' })).toBeVisible()

    expect(screen.getByRole('heading', { level: 2, name: 'Shop by category' })).toBeVisible()
    const tiles = container.querySelectorAll('a[href^="/products?category="]')
    expect(tiles).toHaveLength(categories.length)
    for (const category of categories) {
      const tile = container.querySelector(`a[href="/products?category=${category.id}"]`)
      expect(tile).toBeVisible()
      expect(tile).toHaveTextContent(category.name)
      expect(tile).toHaveTextContent(`${categoryCount(category.id)} products`)
    }

    expect(screen.getByRole('heading', { level: 2, name: 'Popular products' })).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(8)
    const cardNames = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(cardNames).toEqual(popularNames)

    const strip = screen.getByRole('list', { name: 'Delivery and returns' })
    expect(strip.children).toHaveLength(deliveryMethods.length + 1)
    expect(strip).toHaveTextContent('30-day returns')
    expect(screen.getByText('On unused items')).toBeVisible()

    // Screen order: the categories and the grid are the two sections above
    // the delivery strip.
    for (const heading of screen.getAllByRole('heading', { level: 2 })) {
      expect(heading.compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  it('prices the delivery methods from the data, free where they cost nothing', async () => {
    await renderRoute('/')

    expect(screen.getByText('€4.90, 2 to 4 days')).toBeVisible()
    expect(screen.getByText('€9.90, next working day')).toBeVisible()
    expect(screen.getByText('Free, same day')).toBeVisible()
  })

  it('walks the category tiles through to the product list pre-filtered', async () => {
    const { router, container } = await renderRoute('/')

    await userEvent.click(
      container.querySelector<HTMLAnchorElement>('a[href="/products?category=laptops"]')!,
    )

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/products')
    })
    expect(router.state.location.search).toEqual({ category: 'laptops' })
  })

  it('acknowledges add to cart and wish list with a "Report II" toast', async () => {
    await renderRoute('/')

    await userEvent.click(screen.getAllByRole('button', { name: 'Add to cart' })[0])
    expect(screen.getByText('Coming in Report II')).toBeVisible()

    await userEvent.click(screen.getAllByRole('button', { name: 'Add to wish list' })[1])
    expect(screen.getByRole('status')).toHaveTextContent('Coming in Report IIComing in Report II')
  })
})
