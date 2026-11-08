import { render, screen } from '@testing-library/react'

import { OrderLine } from '@/components/order-line'

const item = {
  productId: 'p-01',
  name: 'Volt Air 14',
  unitPriceCents: 129900,
  quantity: 2,
  lineTotalCents: 259800,
}

describe('OrderLine', () => {
  it('shows the thumbnail, name, quantity × price and the line total', () => {
    render(<OrderLine item={item} />)

    const row = screen.getByText('Volt Air 14').closest('[data-slot="list-row"]')
    expect(row).toBeVisible()
    expect(screen.getByText('2 × €1,299.00')).toBeVisible()
    expect(screen.getByText('€2,598.00')).toBeVisible()
    expect(row?.querySelector('[data-slot="product-image"]')).not.toBeNull()
  })

  it('renders as a plain row without a link by default', () => {
    render(<OrderLine item={item} />)

    expect(screen.queryByRole('link')).toBeNull()
  })

  it('links the product name when link is set', () => {
    render(<OrderLine item={item} link />)

    // The whole row is one link to the product page.
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/catalog/p-01')
    expect(links[0]).toHaveTextContent('Volt Air 14')
  })
})
