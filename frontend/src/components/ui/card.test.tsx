import { render, screen } from '@testing-library/react'

import { Card } from '@/components/ui/card'

describe('Card', () => {
  it('renders a section surface with the mockup card classes', () => {
    render(
      <Card data-testid="card">
        <p>Order #1042</p>
      </Card>,
    )

    const card = screen.getByTestId('card')

    expect(card.tagName).toBe('SECTION')
    expect(card).toHaveClass('card')
    expect(card).toHaveClass('rounded-[var(--radius-lg)]')
    expect(card).toHaveClass('bg-card')
    expect(card).toHaveClass('p-5')
  })

  it('renders a link card with the primary hover border when href is set', () => {
    render(
      <Card href="/products/42" data-testid="card-link">
        <p>Router AX3000</p>
      </Card>,
    )

    const card = screen.getByTestId('card-link')

    expect(card.tagName).toBe('A')
    expect(card).toHaveAttribute('href', '/products/42')
    expect(card).toHaveClass('hover:border-primary')
  })

  it('keeps focus visible on link cards', () => {
    render(
      <Card href="/products/42" data-testid="card-focus">
        <p>Keyboard</p>
      </Card>,
    )

    expect(screen.getByTestId('card-focus')).toHaveClass('focus-visible:ring-3')
    expect(screen.getByTestId('card-focus')).toHaveClass('focus-visible:ring-ring/50')
    expect(screen.getByTestId('card-focus')).toHaveClass('focus-visible:outline-1')
  })
})
