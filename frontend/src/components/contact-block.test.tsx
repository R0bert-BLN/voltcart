import { render, screen } from '@testing-library/react'

import { ContactBlock } from '@/components/contact-block'

describe('ContactBlock', () => {
  it('shows the contact name, email and phone', () => {
    render(
      <ContactBlock
        contact={{ name: 'Maya Kowalski', email: 'maya@example.com', phone: '+353 87 555 0100' }}
        address={{ line1: '12 Harbour Street', city: 'Dublin', postcode: 'D02 X285', country: 'Ireland' }}
      />,
    )

    const block = screen.getByText('Maya Kowalski').closest('[data-slot="address-block"]')
    expect(block).toBeInTheDocument()
    expect(block).toHaveTextContent('maya@example.com')
    expect(block).toHaveTextContent('+353 87 555 0100')
  })

  it('shows the delivery address', () => {
    render(
      <ContactBlock
        contact={{ name: 'Maya Kowalski', phone: '+353 87 555 0100' }}
        address={{ line1: '12 Harbour Street', city: 'Dublin', postcode: 'D02 X285', country: 'Ireland' }}
      />,
    )

    const block = screen.getByText('Maya Kowalski').closest('[data-slot="address-block"]')
    expect(block).toBeVisible()
    expect(block).toHaveTextContent('12 Harbour Street')
    expect(block).toHaveTextContent('Dublin D02 X285')
    expect(block).toHaveTextContent('Ireland')
  })

  it('omits the email line when no email is given', () => {
    render(
      <ContactBlock
        contact={{ name: 'Maya Kowalski', phone: '+353 87 555 0100' }}
        address={{ line1: '12 Harbour Street', city: 'Dublin', postcode: 'D02 X285', country: 'Ireland' }}
      />,
    )

    expect(screen.queryByText('maya@example.com')).toBeNull()
  })
})
