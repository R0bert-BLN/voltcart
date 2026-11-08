import { render, screen } from '@testing-library/react'

import { StockBadge } from '@/components/stock-badge'

describe('StockBadge', () => {
  it('shows the in-stock badge from 6 units on', () => {
    render(<StockBadge product={{ stock: 18 }} />)

    const badge = screen.getByText('In stock')
    expect(badge).toBeVisible()
    expect(badge).toHaveAttribute('data-stock', 'in')
    expect(badge).toHaveAttribute('data-tone', 'success')
  })

  it('shows the low-stock badge with the count from 1 to 5 units', () => {
    render(<StockBadge product={{ stock: 5 }} />)

    const badge = screen.getByText('Only 5 left')
    expect(badge).toHaveAttribute('data-stock', 'low')
    expect(badge).toHaveAttribute('data-tone', 'warning')
  })

  it('shows the admin wording when admin is set', () => {
    render(<StockBadge product={{ stock: 3 }} admin />)

    expect(screen.getByText('Low stock')).toHaveAttribute('data-stock', 'low')
  })

  it('shows the out-of-stock badge when the stock is gone', () => {
    render(<StockBadge product={{ stock: 0 }} />)

    const badge = screen.getByText('Out of stock')
    expect(badge).toHaveAttribute('data-stock', 'out')
    expect(badge).toHaveAttribute('data-tone', 'danger')
  })
})
