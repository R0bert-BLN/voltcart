import { render, screen } from '@testing-library/react'

import { OrderStatusBadge } from '@/components/order-status'

describe('OrderStatusBadge', () => {
  it.each([
    ['processing', '', 'Clock'],
    ['shipped', 'info', 'Truck'],
    ['delivered', 'success', 'CircleCheck'],
    ['cancelled', 'danger', 'CircleX'],
  ] as const)('shows %s with its tone and icon', (status, tone, icon) => {
    render(<OrderStatusBadge status={status} />)

    const badge = screen.getByText(status.charAt(0).toUpperCase() + status.slice(1))
    expect(badge).toBeVisible()
    expect(badge).toHaveAttribute('data-tone', tone)
    expect(badge.querySelector(`[data-icon="${icon}"]`)).not.toBeNull()
  })

  it('falls back to the raw text in a neutral badge for an unknown status', () => {
    render(<OrderStatusBadge status="unknown" />)

    expect(screen.getByText('unknown')).toHaveAttribute('data-tone', '')
  })
})
