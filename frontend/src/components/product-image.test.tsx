import { render, screen } from '@testing-library/react'

import { ProductImage } from '@/components/product-image'

const product = { name: 'Corvo 6 Smartphone', categoryId: 'phones' }

describe('ProductImage', () => {
  it('labels the silhouette with the product name', () => {
    render(<ProductImage product={product} />)

    expect(screen.getByRole('img', { name: 'Corvo 6 Smartphone' })).toBeInTheDocument()
  })

  it('draws the silhouette of the product category', () => {
    render(<ProductImage product={product} />)
    const other = render(<ProductImage product={{ name: 'Kite Keyboard', categoryId: 'accessories' }} />, {
      container: document.createElement('div'),
    })

    const phone = screen.getByRole('img', { name: 'Corvo 6 Smartphone' }).querySelector('svg')!
    const keyboard = other.container.querySelector('svg')!
    expect(phone.innerHTML).toContain('<rect x="42" y="8"')
    expect(keyboard.innerHTML).not.toEqual(phone.innerHTML)
  })

  it('falls back to the accessories silhouette for an unknown category', () => {
    render(<ProductImage product={{ name: 'Mystery', categoryId: null }} />)

    const svg = screen.getByRole('img', { name: 'Mystery' }).querySelector('svg')!
    expect(svg.innerHTML).toContain('<rect x="20" y="26"')
  })
})
