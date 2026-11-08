import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { Chips } from '@/components/chips'

const items = [
  { value: 'laptops', label: 'Laptops' },
  { value: 'phones', label: 'Phones' },
]

describe('Chips', () => {
  it('renders a named group of chip buttons', () => {
    render(<Chips items={items} label="Filter by category" selected={null} />)

    const group = screen.getByRole('group', { name: 'Filter by category' })
    expect(group).toBeVisible()
    expect(screen.getByRole('button', { name: 'Laptops' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Phones' })).toBeVisible()
  })

  it('marks the selected value with aria-pressed', () => {
    render(<Chips items={items} selected="phones" />)

    expect(screen.getByRole('button', { name: 'Laptops' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Phones' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('reports a single choice through onChipChange', async () => {
    const user = userEvent.setup()
    const onChipChange = vi.fn()
    render(<Chips items={items} selected="laptops" onChipChange={onChipChange} />)

    await user.click(screen.getByRole('button', { name: 'Phones' }))

    expect(onChipChange).toHaveBeenCalledExactlyOnceWith('phones')
  })

  it('accepts plain strings as items, with the string as value and label', async () => {
    const user = userEvent.setup()
    const onChipChange = vi.fn()
    render(<Chips items={['All']} selected={null} onChipChange={onChipChange} />)

    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(onChipChange).toHaveBeenCalledWith('All')
  })
})
