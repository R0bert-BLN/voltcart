import { render, screen } from '@testing-library/react'

import { SubmitButton } from '@/components/submit-button'

const variants = [
  ['', 'bg-primary'],
  ['secondary', 'bg-secondary'],
  ['ghost', 'hover:bg-muted'],
  ['danger', 'text-destructive'],
] as const

describe('SubmitButton', () => {
  it('renders a submit button with the label text', () => {
    render(<SubmitButton label="Place order" />)

    const button = screen.getByRole('button', { name: 'Place order' })

    expect(button).toBeVisible()
    expect(button).toHaveAttribute('type', 'submit')
  })

  it.each(variants)('maps the "%s" mockup variant to the primitive variant', (flag, expected) => {
    render(<SubmitButton label="Save" variant={flag} />)

    expect(screen.getByRole('button', { name: 'Save' }).className).toContain(expected)
  })

  it('renders a leading icon and spans the block width when asked', () => {
    render(<SubmitButton label="Pay now" icon="Zap" variant="block" data-testid="pay" />)

    const button = screen.getByRole('button', { name: 'Pay now' })

    expect(button).toHaveClass('w-full')
    expect(button.querySelector('svg')).toBeVisible()
    expect(button.querySelector('svg')).toHaveAttribute('data-icon', 'inline-start')
  })
})
