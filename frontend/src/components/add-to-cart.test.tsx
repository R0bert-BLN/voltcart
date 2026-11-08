import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { AddToCart } from '@/components/add-to-cart'

describe('AddToCart', () => {
  it('renders an enabled add-to-cart button for stocked products', () => {
    render(<AddToCart product={{ stock: 18 }} />)

    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeEnabled()
  })

  it('renders a disabled Out of stock button without add for empty stock', () => {
    render(<AddToCart product={{ stock: 0 }} />)

    const button = screen.getByRole('button', { name: 'Out of stock' })
    expect(button).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Add to cart' })).toBeNull()
  })

  it('passes clicks on stocked products to the caller', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<AddToCart product={{ stock: 2 }} onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ type: 'click' }))
  })

  it('blocks clicks when the product is out of stock', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<AddToCart product={{ stock: 0 }} onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Out of stock' }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
