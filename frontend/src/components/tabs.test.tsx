import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { Tabs } from '@/components/tabs'

const items = [
  { id: 'spec', label: 'Specifications', content: <p>Weight table</p> },
  { id: 'stock', label: 'Stock', content: <p>Warehouses</p> },
]

describe('Tabs', () => {
  it('selects the first tab by default and hides the other panels', () => {
    render(<Tabs items={items} />)

    expect(screen.getByRole('tab', { name: 'Specifications' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Weight table')).toBeVisible()
    expect(screen.getByText('Warehouses')).not.toBeVisible()
  })

  it('links each tab to its panel', () => {
    render(<Tabs items={items} />)

    const tab = screen.getByRole('tab', { name: 'Specifications' })
    const panelId = tab.getAttribute('aria-controls') ?? ''
    expect(document.getElementById(panelId)).toHaveAttribute('role', 'tabpanel')
    expect(document.getElementById(panelId)).toHaveAttribute('aria-labelledby', tab.id)
  })

  it('switches panels when a tab is clicked', async () => {
    const user = userEvent.setup()
    render(<Tabs items={items} />)

    await user.click(screen.getByRole('tab', { name: 'Stock' }))

    expect(screen.getByRole('tab', { name: 'Stock' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Warehouses')).toBeVisible()
    expect(screen.getByText('Weight table')).not.toBeVisible()
  })

  it('moves selection and focus with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<Tabs items={items} />)

    await user.tab()
    expect(screen.getByRole('tab', { name: 'Specifications' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'Stock' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Stock' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Warehouses')).toBeVisible()
  })
})
