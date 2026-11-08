import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { RadioCard } from '@/components/radio-card'
import { RadioGroup } from '@/components/radio-group'

describe('RadioGroup', () => {
  it('names the group and keeps exactly one of the radios in it picked', async () => {
    const user = userEvent.setup()
    render(
      <RadioGroup label="Delivery method">
        <RadioCard name="delivery" value="standard" title="Standard courier" />
        <RadioCard name="delivery" value="express" title="Express courier" />
      </RadioGroup>,
    )

    const standard = screen.getByRole('radio', { name: 'Standard courier' })
    const express = screen.getByRole('radio', { name: 'Express courier' })
    expect(screen.getByRole('radiogroup', { name: 'Delivery method' })).toBeVisible()
    expect(standard).not.toBeChecked()
    expect(express).not.toBeChecked()

    await user.click(standard)
    expect(standard).toBeChecked()
    expect(express).not.toBeChecked()

    await user.click(express)
    expect(express).toBeChecked()
    expect(standard).not.toBeChecked()
  })
})
