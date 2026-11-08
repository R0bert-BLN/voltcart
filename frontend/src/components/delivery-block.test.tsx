import { render, screen } from '@testing-library/react'

import { DeliveryBlock } from '@/components/delivery-block'

describe('DeliveryBlock', () => {
  it('shows the method name with its time and price', () => {
    render(
      <DeliveryBlock method={{ name: 'Standard courier', days: 4 }} delivery={490} payment="card" />,
    )

    const block = screen.getByText('Standard courier').closest('[data-slot="address-block"]')
    expect(block).toBeVisible()
    expect(screen.getByText('4 days · €4.90')).toBeVisible()
    expect(screen.getByText('Card')).toBeInTheDocument()
  })

  it('says the delivery is free while it costs nothing', () => {
    render(<DeliveryBlock method={{ name: 'Store pickup', days: 0 }} delivery={0} payment="cod" />)

    expect(screen.getByText('0 days · Free')).toBeVisible()
    expect(screen.getByText('Cash on delivery')).toBeInTheDocument()
  })

  it('says the delivery is free while it is not priced yet', () => {
    render(
      <DeliveryBlock method={{ name: 'Store pickup', days: 0 }} delivery={null} payment="cod" />,
    )

    expect(screen.getByText('0 days · Free')).toBeVisible()
  })

  it('says the delivery is chosen at checkout while no method is picked', () => {
    render(<DeliveryBlock method={null} delivery={null} payment="card" />)

    expect(screen.getByText('Chosen at checkout')).toBeInTheDocument()
  })

  it('shows an unknown payment method as given', () => {
    render(<DeliveryBlock method={{ name: 'Store pickup', days: 0 }} delivery={0} payment="invoice" />)

    expect(screen.getByText('invoice')).toBeInTheDocument()
  })
})
