import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'

import { CheckoutGate } from '@/components/checkout-gate'

/** Renders inside a minimal router, since the gates' buttons with hrefs are router links. */
const renderGate = async (ui: React.ReactElement) => {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory(),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

describe('CheckoutGate', () => {
  it('shows the empty-cart state with a link to the products', async () => {
    await renderGate(<CheckoutGate empty blocker={null} />)

    expect(screen.getByRole('status')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument()
    expect(screen.getByText('Add a product to start your order.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse all products' })).toHaveAttribute('href', '/')
  })

  it('shows the blocker with a way back to the cart', async () => {
    await renderGate(<CheckoutGate empty={false} blocker="Your cart needs a delivery method." />)

    expect(screen.getByRole('status')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Your cart needs a change' })).toBeInTheDocument()
    expect(screen.getByText('Your cart needs a delivery method.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to cart' })).toBeInTheDocument()
  })

  it('renders nothing while the cart can go to checkout', () => {
    const { container } = render(<CheckoutGate empty={false} blocker={null} />)

    expect(container).toBeEmptyDOMElement()
  })
})
