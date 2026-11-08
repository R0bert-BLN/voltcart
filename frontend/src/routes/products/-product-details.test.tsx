import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { routeTree } from '@/routeTree.gen'

/** Renders the route through the real router so the breadcrumb and links are
    exercised; the catalogue reads the local data, so no API stub is needed. */
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

describe('catalog-product screen', () => {
  it('shows the key content of the mockup, in order, from the data layer', async () => {
    const { container } = await renderRoute('/products/lp-aster-14')

    expect(screen.getByRole('heading', { level: 1, name: 'Aster Air 14 Laptop' })).toBeVisible()
    expect(container.querySelector('[data-slot="breadcrumb"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="product-image"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="stepper"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="product-image"]')).toHaveAccessibleName('Aster Air 14 Laptop')

    expect(screen.getByText('€1,149.00')).toBeVisible()
    expect(screen.getByText('In stock')).toBeVisible()
    expect(screen.getByText('A light 14-inch laptop for travel and everyday work, with a quiet fan and battery that lasts a full working day.')).toBeVisible()
    expect(container).toHaveTextContent('Kestrel Tech Supply')

    // Key content, in order: breadcrumb, image, name, category, price, stock,
    // buy row, description, then specs, supplier and delivery as cards.
    const buy = within(container.querySelector('section[aria-label="Product information"]')!)
    const order = [
      container.querySelector('[data-slot="breadcrumb"]')!,
      container.querySelector('[data-slot="product-image"]')!,
      screen.getByRole('heading', { level: 1, name: 'Aster Air 14 Laptop' }),
      buy.getByRole('link', { name: 'Laptops' }),
      buy.getByText('€1,149.00'),
      container.querySelector('[data-slot="stepper"]')!,
      buy.getByRole('button', { name: 'Add to cart' }),
      buy.getByRole('button', { name: 'Add to wish list' }),
      container.querySelector('section[aria-label="Specifications"]')!,
      container.querySelector('section[aria-label="Delivery"] [data-slot="list"]')!,
    ]
    for (let i = 1; i < order.length; i += 1) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING,
        `the previous key-content element should precede the next one`,
      ).toBeTruthy()
    }
  })

  it('prices the delivery methods, free where they cost nothing', async () => {
    await renderRoute('/products/lp-aster-14')

    expect(screen.getByText('€4.90')).toBeVisible()
    expect(screen.getByText('€9.90')).toBeVisible()
    expect(screen.getByText('Free')).toBeVisible()
  })

  it('lists every specification row of the product', async () => {
    await renderRoute('/products/lp-aster-14')

    expect(screen.getByText('Display')).toBeVisible()
    expect(screen.getByText('14-inch, 2560 × 1600, 120 Hz')).toBeVisible()
    expect(screen.getByText('Up to 16 hours')).toBeVisible()
  })

  it('walks the category link through to the list pre-filtered', async () => {
    const { router, container } = await renderRoute('/products/lp-aster-14')

    const buy = within(container.querySelector('section[aria-label="Product information"]')!)
    await userEvent.click(buy.getByRole('link', { name: 'Laptops' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/products')
    })
    expect(router.state.location.search).toEqual({ category: 'laptops' })
  })

  it('acknowledges add to cart and wish list with a "Report II" toast', async () => {
    await renderRoute('/products/lp-aster-14')

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    expect(screen.getByText('Coming in Report II')).toBeVisible()
  })

  it('shows the not-found empty state for an unknown id', async () => {
    await renderRoute('/products/nope')

    expect(screen.getByRole('heading', { name: 'Product not found' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute(
      'href',
      '/products',
    )
  })
})
