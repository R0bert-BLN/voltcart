import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { categories, products, suppliers } from '@/lib/mock-data'
import { routeTree } from '@/routeTree.gen'

/** Renders the route through the real router so the links are exercised.
    Without a token the account queries stay disabled, so no API stub is
    needed; the overview's name falls back to the data layer's admin. */
const renderRoute = async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const history = createMemoryHistory({ initialEntries: ['/admin'] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

const statusOf = (product: (typeof products)[number]) =>
  product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : 'in'
const lowStock = products
  .filter((product) => statusOf(product) === 'low')
  .sort((a, b) => a.stock - b.stock)
const supplierName = (id: string) => suppliers.find((supplier) => supplier.id === id)!.name

describe('admin dashboard screen', () => {
  it('shows the overview head with the sign-in note and the add-product action', async () => {
    await renderRoute()

    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeVisible()
    expect(screen.getByText('Signed in as Daniel Roth.')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Add product' })).toHaveAttribute(
      'href',
      '/admin/products/new',
    )
  })

  it('shows the four count tiles from the data, in order, with their links', async () => {
    const { container } = await renderRoute()

    const tiles = [...container.querySelectorAll('[data-slot=stat]')]
    expect(tiles.map((tile) => tile.textContent)).toEqual([
      `${products.length}Products`,
      `${categories.length}Categories`,
      `${lowStock.length}Low stock`,
      '2Out of stock',
    ])
    expect(tiles.map((tile) => tile.getAttribute('href'))).toEqual([
      '/admin/products',
      null,
      '/admin/products?stock=low',
      '/admin/products?stock=out',
    ])
  })

  it('lists the low-stock products, rarest stock first, each with a stock update link', async () => {
    const { container } = await renderRoute()

    expect(screen.getByRole('heading', { level: 2, name: 'Needs attention' })).toBeVisible()

    const rows = [...container.querySelectorAll('[data-slot=list-row]')]
    expect(rows.map((row) => row.querySelector('img, [role=img]')?.getAttribute('aria-label'))).toEqual(
      lowStock.map((product) => product.name),
    )
    rows.forEach((row, index) => {
      const product = lowStock[index]
      expect(row).toHaveTextContent(product.name)
      expect(row).toHaveTextContent(
        `${product.stock} ${product.stock === 1 ? 'unit' : 'units'} left · ${supplierName(product.supplierId)}`,
      )
    })

    const update = screen.getAllByRole('link', { name: `Update stock of ${lowStock[0].name}` })
    expect(update).toHaveLength(1)
    expect(update[0]).toHaveAttribute('href', `/admin/products/${lowStock[0].id}/edit?focus=stock`)
  })

  it('keeps the head, tiles and attention list in the order of the mockup', async () => {
    const { container } = await renderRoute()

    const head = container.querySelector('[data-slot=page-head]')!
    const grid = container.querySelector('[data-slot=stat-grid]')!
    const section = screen.getByRole('heading', { level: 2, name: 'Needs attention' })
    expect(head.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(grid.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
