import { render, screen } from '@testing-library/react'

import { Icon } from '@/components/ui/icon'

describe('Icon', () => {
  it('renders the named lucide icon as an svg hidden from the accessibility tree', () => {
    render(<Icon name="ShoppingCart" data-testid="icon" />)

    const icon = screen.getByTestId('icon')

    expect(icon).toBeVisible()
    expect(icon).toHaveAttribute('data-icon', 'ShoppingCart')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('falls back to the alert circle for an unknown name instead of throwing', () => {
    render(<Icon name={'no-such-lucide-icon' as never} data-testid="icon-fallback" />)

    const icon = screen.getByTestId('icon-fallback')

    expect(icon).toBeVisible()
    expect(icon).toHaveAttribute('data-icon', 'no-such-lucide-icon')
  })

  it('is hidden from the accessibility tree and accepts svg props', () => {
    render(<Icon name="Zap" className="size-4" data-testid="icon-props" aria-hidden />)

    expect(screen.getByTestId('icon-props')).toBeVisible()
  })
})
