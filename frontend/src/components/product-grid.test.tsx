import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/react'

import { ProductGrid } from '@/components/product-grid'
import type { ProductData } from '@/api/generated/types'

const product = (id: string, overrides: Partial<ProductData> = {}): ProductData => ({
  id,
  name: `Product ${id}`,
  description: '',
  priceCents: 49900,
  stock: 7,
  image: '',
  stockStatus: 'in_stock',
  specs: [],
  supplier: null,
  deliveryMethods: [],
  categoryId: 'laptops',
  categoryName: 'Laptops',
  ...overrides,
})

/** Renders inside a minimal router, since each card's name is a router link. */
const renderGrid = async (ui: React.ReactElement) => {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory(),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

describe('ProductGrid', () => {
  it('renders one card per product with its own stock status', async () => {
    await renderGrid(<ProductGrid products={[product('p1'), product('p2', { stock: 0 })]} />)

    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]!).getByRole('heading', { name: 'Product p1' })).toBeVisible()
    expect(within(cards[0]!).getByRole('button', { name: 'Add to cart' })).toBeEnabled()
    expect(within(cards[1]!).getByRole('button', { name: 'Out of stock' })).toBeDisabled()
  })

  it('marks the wished products through their ids', async () => {
    await renderGrid(<ProductGrid products={[product('p1'), product('p2')]} wishedIds={['p2']} />)

    const cards = screen.getAllByRole('article')
    expect(within(cards[0]!).getByRole('button', { name: 'Add to wish list' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(cards[1]!).getByRole('button', { name: 'Remove from wish list' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('reports toggles and adds with the product they belong to', async () => {
    const user = userEvent.setup()
    const onWish = vi.fn()
    const onAdd = vi.fn()
    await renderGrid(<ProductGrid products={[product('p1'), product('p2')]} onWish={onWish} onAdd={onAdd} />)

    const cards = screen.getAllByRole('article')
    await user.click(within(cards[1]!).getByRole('button', { name: 'Add to wish list' }))
    await user.click(within(cards[0]!).getByRole('button', { name: 'Add to cart' }))

    expect(onWish).toHaveBeenCalledExactlyOnceWith(product('p2'))
    expect(onAdd).toHaveBeenCalledExactlyOnceWith(product('p1'))
  })
})
