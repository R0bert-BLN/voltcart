import { render, screen } from '@testing-library/react'

import { SectionTitle } from '@/components/section-title'

describe('SectionTitle', () => {
  it('renders the title as an h2', () => {
    render(<SectionTitle title="Order details" />)

    expect(screen.getByRole('heading', { level: 2, name: 'Order details' })).toBeVisible()
  })

  it('renders the trailing action beside the title', () => {
    render(<SectionTitle title="Addresses" action={<button type="button">Add address</button>} />)

    const action = screen.getByRole('button', { name: 'Add address' })
    expect(action).toBeVisible()
    expect(action.closest('[data-slot="section-title"]')).not.toBeNull()
  })

  it('renders nothing but the title without an action', () => {
    render(<SectionTitle title="Order details" />)

    const title = screen.getByRole('heading', { name: 'Order details' })
    expect(title.parentElement).toHaveAttribute('data-slot', 'section-title')
  })
})
