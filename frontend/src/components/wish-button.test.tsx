import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { WishButton } from '@/components/wish-button'

describe('WishButton', () => {
  it('renders a not-pressed toggle named Add to wish list', () => {
    render(<WishButton pressed={false} />)

    const button = screen.getByRole('button', { name: 'Add to wish list' })
    expect(button).toBeVisible()
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('names the pressed state Remove from wish list', () => {
    render(<WishButton pressed />)

    expect(screen.getByRole('button', { name: 'Remove from wish list' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('fires onToggle on click and stays owned by the caller', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<WishButton pressed={false} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: 'Add to wish list' }))

    expect(onToggle).toHaveBeenCalledExactlyOnceWith()
    // No internal state: the same aria-pressed stays until the caller re-renders.
    expect(screen.getByRole('button', { name: 'Add to wish list' })).toBeInTheDocument()
  })
})
