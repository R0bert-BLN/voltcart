import { useState } from 'react'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { Sheet } from '@/components/sheet'

function Fixture({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <Sheet title="Confirm" open={open} onOpenChange={(next) => { onOpenChange?.(next); setOpen(next) }}>
      <p>Body copy</p>
    </Sheet>
  )
}

describe('Sheet', () => {
  it('is an accessible modal dialog labelled by its title', () => {
    render(<Fixture />)

    expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeVisible()
  })

  it('stays out of the accessibility tree when closed', () => {
    render(<Sheet title="Confirm" open={false}>Body copy</Sheet>)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes through the close button and Escape', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Fixture onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
