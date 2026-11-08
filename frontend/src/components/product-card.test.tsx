import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/react'

import { ProductCard } from '@/components/product-card'
import type { ProductData } from '@/api/generated/types'

const product = (overrides: Partial<ProductData> = {}): ProductData => ({
  id: 'p1',
  name: 'Aster Air 14',
  description: '',
  priceCents: 114900,
  stock: 18,
  image: '',
  stockStatus: 'in_stock',
  specs: [],
  supplier: null,
  deliveryMethods: [],
  categoryId: 'laptops',
  categoryName: 'Laptops',
  ...overrides,
})

describe('ProductCard', () => {
  it('renders image, name, category, price, stock badge and add button', () => {
    render(<ProductCard product={product()} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Aster Air 14' })).toBeVisible()
    expect(screen.getByText('Laptops')).toBeVisible()
    expect(screen.getByText('€1,149.00')).toBeVisible()
    expect(screen.getByText('In stock')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeEnabled()
  })

  it('omits the category line when the product has none', () => {
    render(<ProductCard product={product({ categoryName: null })} />)

    expect(screen.getByRole('heading', { name: 'Aster Air 14' })).toBeVisible()
    expect(screen.queryByText('Laptops')).toBeNull()
  })

  it('reports the wish toggle and the add action with the product', async () => {
    const user = userEvent.setup()
    const onWish = vi.fn()
    const onAdd = vi.fn()
    render(<ProductCard product={product()} wished onWish={onWish} onAdd={onAdd} />)

    expect(screen.getByRole('button', { name: 'Remove from wish list' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: 'Remove from wish list' }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(onWish).toHaveBeenCalledExactlyOnceWith()
    expect(onAdd).toHaveBeenCalledExactlyOnceWith(product())
  })

  it('disables add-to-cart for an out-of-stock product', () => {
    render(<ProductCard product={product({ stock: 0, stockStatus: 'out_of_stock' })} />)

    const card = screen.getByRole('article')
    expect(within(card).getByRole('button', { name: 'Out of stock' })).toBeDisabled()
    expect(within(card).getAllByText('Out of stock')).toHaveLength(2)
  })
})
