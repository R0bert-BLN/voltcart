import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { RadioCard } from '@/components/radio-card'

describe('RadioCard', () => {
  it('links the input to the card text and selects one of a group', async () => {
    const user = userEvent.setup()
    render(
      <div role="radiogroup" aria-label="Delivery">
        <RadioCard name="delivery" value="standard" title="Standard courier" />
        <RadioCard name="delivery" value="express" title="Express courier" trail="€9.90" />
      </div>,
    )

    const standard = screen.getByRole('radio', { name: /Standard courier/ })
    const express = screen.getByRole('radio', { name: /Express courier/ })
    expect(standard).not.toBeChecked()
    expect(express).not.toBeChecked()

    await user.click(express)
    expect(express).toBeChecked()
    expect(standard).not.toBeChecked()
  })

  it('renders the checked card as selected with aria-checked on the radio', () => {
    render(<RadioCard name="delivery" value="express" title="Express courier" checked />)

    expect(screen.getByRole('radio', { name: 'Express courier' })).toBeChecked()
  })

  it('is hidden from pointer interaction when disabled', () => {
    render(<RadioCard name="delivery" value="express" title="Express courier" disabled />)

    expect(screen.getByRole('radio', { name: 'Express courier' })).toBeDisabled()
  })
})
