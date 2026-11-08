import { render, screen } from '@testing-library/react'

import { Timeline } from '@/components/timeline'

const steps = [
  { label: 'Order placed', text: 'Mon 12 May', state: 'done' as const },
  { label: 'Shipped', text: 'Not yet', state: 'todo' as const },
]

describe('Timeline', () => {
  it('renders one icon and label per step with its muted text', () => {
    render(<Timeline steps={steps} />)

    expect(screen.getByText('Order placed')).toBeVisible()
    expect(screen.getByText('Mon 12 May')).toBeInTheDocument()
    expect(screen.getByText('Shipped')).toBeInTheDocument()
    expect(screen.getByText('Not yet')).toBeInTheDocument()
  })

  it('marks the state of every step', () => {
    render(
      <Timeline
        steps={[
          ...steps,
          { label: 'Cancelled', text: 'Wed 14 May', state: 'stopped' },
        ]}
      />,
    )

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveAttribute('data-state', 'done')
    expect(items[1]).toHaveAttribute('data-state', 'todo')
    expect(items[2]).toHaveAttribute('data-state', 'stopped')
  })

  it('uses the state icons', () => {
    render(
      <Timeline
        steps={[
          { label: 'Order placed', state: 'done' },
          { label: 'Cancelled', state: 'stopped' },
          { label: 'Delivered', state: 'todo' },
        ]}
      />,
    )

    const liFor = (label: string) => screen.getByText(label).closest('li')
    expect(liFor('Order placed')?.querySelector('svg[data-icon="CircleCheck"]')).not.toBeNull()
    expect(liFor('Cancelled')?.querySelector('svg[data-icon="CircleX"]')).not.toBeNull()
    expect(liFor('Delivered')?.querySelector('svg[data-icon="Circle"]')).not.toBeNull()
  })
})
