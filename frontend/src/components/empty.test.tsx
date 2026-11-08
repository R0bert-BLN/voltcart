import { render, screen } from '@testing-library/react'

import { Empty } from '@/components/empty'

describe('Empty', () => {
  it('renders the title, text and action inside a status region', () => {
    render(
      <Empty icon="Inbox" title="Nothing here yet" text="Add a product to start your order.">
        <a href="/catalog">Browse the catalogue</a>
      </Empty>,
    )

    const status = screen.getByRole('status')
    expect(status).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Nothing here yet' })).toBeVisible()
    expect(screen.getByText('Add a product to start your order.')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Browse the catalogue' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })

  it('renders the icon hidden from the accessibility tree', () => {
    render(<Empty icon="Inbox" title="Nothing here yet" />)

    const icon = document.querySelector('[data-icon="Inbox"]')
    expect(icon).toBeVisible()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('omits the text line when there is none', () => {
    render(<Empty icon="Inbox" title="Nothing here yet" />)

    const status = screen.getByRole('status')
    expect(status.querySelectorAll('p')).toHaveLength(0)
  })
})
