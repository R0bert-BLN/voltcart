import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { FilterCheck } from '@/components/filter-check'

describe('FilterCheck', () => {
  it('renders the given name and value as a checked box with a count', () => {
    render(
      <FilterCheck name="deliveryIds" value="express" label="Express courier" count={12} defaultChecked />,
    )

    const input = screen.getByRole('checkbox', { name: /^Express courier/ })
    expect(input).toHaveAttribute('name', 'deliveryIds')
    expect(input).toHaveAttribute('value', 'express')
    expect(input).toBeChecked()
    expect(screen.getByText('12')).toBeVisible()
  })

  it('omits the count until it is given', () => {
    render(<FilterCheck name="deliveryIds" value="express" label="Express courier" />)

    expect(screen.queryByText(/^\d+$/)).toBeNull()
  })

  it('toggles from the whole row and reports the change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FilterCheck name="deliveryIds" value="express" label="Express courier" onChange={onChange} />,
    )

    const input = screen.getByRole('checkbox', { name: /^Express courier/ })
    expect(input).not.toBeChecked()

    await user.click(screen.getByText('Express courier'))
    expect(input).toBeChecked()
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('is hidden from pointer interaction when disabled', () => {
    render(<FilterCheck name="deliveryIds" value="express" label="Express courier" disabled />)

    expect(screen.getByRole('checkbox', { name: /^Express courier/ })).toBeDisabled()
  })
})
