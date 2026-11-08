import { render, screen } from '@testing-library/react'

import { Note } from '@/components/note'

describe('Note', () => {
  it('renders the default legal note', () => {
    render(<Note />)

    const note = screen.getByRole('note')
    expect(note).toBeVisible()
    expect(note).toHaveTextContent(/legal/i)
    expect(screen.queryByText(/implementation/i)).toBeVisible()
  })

  it('renders custom text', () => {
    render(<Note text="Prices include VAT." />)

    expect(screen.getByRole('note')).toHaveTextContent('Prices include VAT.')
  })
})
