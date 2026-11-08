import { render, screen } from '@testing-library/react'

import { List, ListRow } from '@/components/list'

describe('ListRow', () => {
  it('renders the title with an optional muted subtitle', () => {
    render(<ListRow title="Volt Air 14" subtitle="Ships in 2 days" />)

    const row = screen.getByText('Volt Air 14').closest('[data-slot="list-row"]')
    expect(row).toBeVisible()
    expect(screen.getByText('Ships in 2 days')).toBeVisible()
  })

  it('renders lead and trail slots around the text', () => {
    render(
      <ListRow
        title="Volt Air 14"
        lead={<span data-testid="lead">lead</span>}
        trail={<span data-testid="trail">trail</span>}
      />,
    )

    const row = screen.getByText('Volt Air 14').closest('[data-slot="list-row"]')
    expect(row).toHaveTextContent('lead')
    expect(row).toHaveTextContent('trail')
  })

  it('renders as a link when a href is given', () => {
    render(<ListRow title="Volt Air 14" href="/catalog/volt-air-14" />)

    expect(screen.getByRole('link', { name: 'Volt Air 14' })).toHaveAttribute(
      'href',
      '/catalog/volt-air-14',
    )
  })
})

describe('List', () => {
  it('wraps list rows in a bordered list with the list-row slot', () => {
    render(
      <List>
        <ListRow title="Row one" />
        <ListRow title="Row two" />
      </List>,
    )

    const list = screen.getByText('Row one').closest('[data-slot="list"]')
    expect(list).toBeVisible()
    expect(list?.querySelectorAll('[data-slot="list-row"]')).toHaveLength(2)
  })
})
