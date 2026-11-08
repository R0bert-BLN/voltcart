import { render, screen } from '@testing-library/react'

import { Table } from '@/components/table'

const columns = [
  { label: 'Product' },
  { label: 'Stock', num: true },
]

describe('Table', () => {
  it('renders the header row and the body cells', () => {
    render(<Table columns={columns} rows={[['Corvo 6 Smartphone', '12']]} />)

    expect(screen.getByRole('columnheader', { name: 'Product' })).toHaveAccessibleName('Product')
    expect(screen.getByRole('cell', { name: 'Corvo 6 Smartphone' })).toBeInTheDocument()
  })

  it('marks numeric columns up with the column header for assistive tech', () => {
    render(<Table columns={columns} rows={[['Corvo 6 Smartphone', '12']]} />)

    const stock = screen.getByRole('columnheader', { name: 'Stock' })
    expect(stock).toHaveClass('text-right', 'tabular-nums')
    expect(screen.getByRole('cell', { name: '12' })).toHaveClass('text-right', 'tabular-nums')
  })

  it('sets extra attributes on the row', () => {
    render(
      <Table
        columns={columns}
        rows={[{ cells: ['Corvo 6 Smartphone', '12'], 'data-testid': 'featured' }]}
      />,
    )

    const row = screen.getByTestId('featured')
    expect(row.tagName).toBe('TR')
    expect(row).toHaveTextContent('Corvo 6 Smartphone')
  })
})
