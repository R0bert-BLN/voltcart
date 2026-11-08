import { render, screen } from '@testing-library/react'

import { PageHead } from '@/components/page-head'

describe('PageHead', () => {
  it('renders the title as the h1 of the mockup page head', () => {
    render(<PageHead title="Your cart" />)

    const title = screen.getByRole('heading', { level: 1, name: 'Your cart' })
    const head = title.closest('[data-slot="page-head"]')

    expect(head).toBeVisible()
    expect(head).toHaveClass('flex', 'items-start', 'justify-between', 'gap-4')
  })

  it('renders the muted subtitle only when given', () => {
    const { unmount } = render(<PageHead title="Checkout" subtitle="Step 2 of 3" />)

    expect(screen.getByText('Step 2 of 3')).toBeVisible()
    unmount()

    render(<PageHead title="Checkout" />)

    expect(screen.queryByText(/step/i)).toBeNull()
  })

  it('renders the trailing actions row beside the title stack', () => {
    render(
      <PageHead title="Products" actions={<button type="button">New product</button>} />,
    )

    const actions = screen.getByRole('button', { name: 'New product' }).closest('[data-slot=page-head] [class*=row]')

    expect(screen.getByRole('button', { name: 'New product' })).toBeVisible()
    expect(actions).toBeVisible()
  })
})
