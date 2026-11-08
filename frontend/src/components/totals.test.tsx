import { render, screen } from '@testing-library/react'

import { Totals } from '@/components/totals'

describe('Totals', () => {
  it('shows subtotal, free delivery and the total', () => {
    render(<Totals subtotal={120000} delivery={0} />)

    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    // With free delivery the subtotal and the total are the same amount.
    expect(screen.getAllByText('€1,200.00')).toHaveLength(2)
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('prices a chosen delivery method into the total', () => {
    render(<Totals subtotal={129900} delivery={490} />)

    expect(screen.getByText('Delivery')).toBeInTheDocument()
    expect(screen.getByText('€4.90')).toBeInTheDocument()
    expect(screen.getByText('€1,303.90')).toBeInTheDocument()
  })

  it('says the delivery is chosen at checkout while no method is picked', () => {
    render(<Totals subtotal={129900} delivery={null} />)

    expect(screen.getByText('Chosen at checkout')).toBeInTheDocument()
    expect(screen.getAllByText('€1,299.00')).toHaveLength(2)
  })

  it('labels the delivery line, e.g. for a pickup', () => {
    render(<Totals subtotal={129900} delivery={0} deliveryLabel="Store pickup" />)

    expect(screen.getByText('Store pickup')).toBeInTheDocument()
  })
})
