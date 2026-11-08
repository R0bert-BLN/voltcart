import { render, screen } from '@testing-library/react'

import { Select } from '@/components/select'

const options = ['Standard', 'Express']

describe('Select', () => {
  it('labels the control and offers the choices', () => {
    render(<Select label="Delivery" name="delivery" options={options} />)

    const select = screen.getByRole('combobox', { name: 'Delivery' })
    expect(select.tagName).toBe('SELECT')
    expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(options.length)
  })

  it('opens with an optional disabled placeholder', () => {
    render(
      <Select label="Delivery" name="delivery" options={options} placeholder="Choose one" />,
    )

    const placeholder = screen.getByRole('option', { name: 'Choose one' }) as HTMLSelectElement
    expect(placeholder).toBeVisible()
  })

  it('exposes an error message and marks the control invalid', () => {
    render(<Select label="Delivery" name="delivery" options={options} error="Required." />)

    const select = screen.getByRole('combobox', { name: 'Delivery' })
    expect(select).toBeInvalid()
    expect(select).toHaveAccessibleDescription('Required.')
  })
})
