import { render, screen } from '@testing-library/react'

import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders the text in a pill with the neutral tone by default', () => {
    render(<Badge>Out of stock</Badge>)

    const badge = screen.getByText('Out of stock')

    expect(badge).toBeVisible()
    expect(badge).toHaveAttribute('data-slot', 'badge')
    expect(badge).toHaveAttribute('data-tone', '')
  })

  it.each([
    ['info', 'bg-(--primary-soft)'],
    ['success', 'bg-(--success-soft)'],
    ['warning', 'bg-(--warning-soft)'],
    ['danger', 'bg-(--danger-soft)'],
  ] as const)('maps the %s tone to the soft mockup tokens', (tone, expected) => {
    render(<Badge tone={tone}>Delayed</Badge>)

    expect(screen.getByText('Delayed')).toHaveAttribute('data-tone', tone)
    expect(screen.getByText('Delayed').className).toContain(expected)
  })

  it('renders an optional leading icon hidden from the tree', () => {
    render(<Badge tone="success" icon="CircleCheck">On time</Badge>)

    const icon = screen.getByText('On time').querySelector('svg')

    expect(icon).toBeVisible()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})
