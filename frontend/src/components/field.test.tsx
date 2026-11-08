import { render, screen } from '@testing-library/react'

import { Field } from '@/components/field'

describe('Field', () => {
  it('links the label to the input and describes it with the hint', () => {
    render(<Field label="Email" name="email" hint="We never share it." />)

    const input = screen.getByLabelText('Email')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAccessibleDescription('We never share it.')
  })

  it('exposes an error message and marks the input invalid', () => {
    render(<Field label="Email" name="email" error="Enter a valid email." />)

    const input = screen.getByLabelText('Email')
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription('Enter a valid email.')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email.')
  })

  it('stays clean of error markup when there is no error', () => {
    render(<Field label="Email" name="email" />)

    const input = screen.getByLabelText('Email')
    expect(input).not.toBeInvalid()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
