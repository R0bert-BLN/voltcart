import { render, screen } from '@testing-library/react'

import { Steps } from '@/components/steps'

describe('Steps', () => {
  const items = [
    { label: 'Cart', href: '/checkout/cart' },
    { label: 'Delivery', href: '/checkout/delivery' },
    { label: 'Payment' },
    { label: 'Review' },
  ]

  it('numbers the steps inside a labelled list', () => {
    render(<Steps current={2} items={items} />)

    const list = screen.getByRole('list', { name: 'Checkout, step 2 of 4' })
    expect(list).toBeVisible()
    expect(list.children).toHaveLength(4)
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('marks the current step and leaves it unlinked', () => {
    render(<Steps current={3} items={items} />)

    expect(screen.getByText('Payment').closest('li')).toHaveAttribute('aria-current', 'step')
    expect(screen.queryByRole('link', { name: /Payment/ })).toBeNull()
  })

  it('renders an earlier step with a href as a link', () => {
    render(<Steps current={2} items={items} />)

    expect(screen.getByRole('link', { name: /Cart/ })).toHaveAttribute('href', '/checkout/cart')
    // Steps after the current one render as plain text.
    expect(screen.queryByRole('link', { name: /Review/ })).toBeNull()
  })

  it('shows a check in the number of the steps before the current one', () => {
    render(<Steps current={3} items={items} />)

    // The done steps' number circle carries the check icon.
    expect(screen.getByRole('link', { name: /Cart/ }).querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('link', { name: /Delivery/ }).querySelector('svg')).not.toBeNull()
    expect(screen.getByText('Payment').closest('li')?.querySelector('svg')).toBeNull()
  })
})
