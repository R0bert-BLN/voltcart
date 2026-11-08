import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { useState } from 'react'

import { Stepper } from '@/components/stepper'

describe('Stepper', () => {
  it('labels the group and the input for assistive tech', () => {
    render(<Stepper value={2} />)

    const input = screen.getByRole('spinbutton', { name: 'Quantity' })
    expect(input).toHaveValue(2)
    expect(screen.getByRole('group', { name: 'Quantity' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Quantity' })).toContainElement(input)
  })

  it('disables the minus at the min and the plus at the max', () => {
    render(<Stepper value={1} min={1} max={3} />)

    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Increase' })).toBeEnabled()
  })

  it('disables the plus at the max', () => {
    render(<Stepper value={3} min={1} max={3} />)

    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled()
  })

  it('fires onValueChange when a step button is pressed', async () => {
    const user = userEvent.setup()
    const Harness = () => {
      const [value, setValue] = useState(2)
      return (
        <Stepper
          value={value}
          min={1}
          max={3}
          onValueChange={(next) => setValue(next)}
        />
      )
    }
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Increase' }))
    expect(screen.getByRole('spinbutton')).toHaveValue(3)

    await user.click(screen.getByRole('button', { name: 'Decrease' }))
    expect(screen.getByRole('spinbutton')).toHaveValue(2)
  })
})
