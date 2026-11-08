import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { Check } from '@/components/check'

describe('Check', () => {
  it('links the label to the checkbox and toggles on click', async () => {
    const user = userEvent.setup()
    render(<Check label="I agree to the terms" name="terms" />)

    const input = screen.getByRole('checkbox', { name: 'I agree to the terms' })
    expect(input).not.toBeChecked()

    await user.click(input)
    expect(input).toBeChecked()
  })

  it('exposes an error message and marks the control invalid', () => {
    render(<Check label="I agree to the terms" name="terms" error="Please accept the terms." />)

    const input = screen.getByRole('checkbox', { name: 'I agree to the terms' })
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription('Please accept the terms.')
  })

  it('is hidden from the accessibility tree when disabled', () => {
    render(<Check label="I agree to the terms" name="terms" disabled />)

    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
