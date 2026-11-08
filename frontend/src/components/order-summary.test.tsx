import { render, screen } from '@testing-library/react'

import { OrderSummary } from '@/components/order-summary'

const items = [
  { productId: 'p-01', name: 'Volt Air 14', unitPriceCents: 129900, quantity: 1, lineTotalCents: 129900 },
  { productId: 'p-02', name: 'Volt Buds Pro', unitPriceCents: 4990, quantity: 2, lineTotalCents: 9980 },
]

describe('OrderSummary', () => {
  it('lists the items with their line totals and the money summary', () => {
    render(<OrderSummary items={items} delivery={490} />)

    expect(screen.getByText('Order summary')).toBeVisible()
    expect(screen.getByText('Volt Air 14 × 1')).toBeInTheDocument()
    expect(screen.getByText('Volt Buds Pro × 2')).toBeInTheDocument()
    expect(screen.getByText('€1,299.00')).toBeInTheDocument()
    expect(screen.getByText('€99.80')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('sums the item lines into the subtotal', () => {
    render(<OrderSummary items={items} delivery={0} />)

    expect(screen.getAllByText('€1,398.80')).toHaveLength(2)
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('says the delivery is chosen at checkout while no method is picked', () => {
    render(<OrderSummary items={items} />)

    expect(screen.getByText('Chosen at checkout')).toBeInTheDocument()
  })

  it('labels the delivery line, e.g. for a pickup', () => {
    render(<OrderSummary items={items} delivery={0} deliveryLabel="Store pickup" />)

    expect(screen.getByText('Store pickup')).toBeInTheDocument()
  })
})
