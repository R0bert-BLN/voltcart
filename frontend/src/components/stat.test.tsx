import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'

import { Stat } from '@/components/stat'

/** Renders inside a minimal router, since the link tile is a router link. */
const renderStat = async (ui: React.ReactElement) => {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory(),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

describe('Stat', () => {
  it('renders the icon, value and label as a plain tile', () => {
    render(<Stat label="Orders today" value={42} icon="ShoppingCart" />)

    expect(screen.getByText('42')).toBeVisible()
    expect(screen.getByText('Orders today')).toBeVisible()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders as a link tile with href', async () => {
    await renderStat(<Stat label="Low stock" value={3} icon="ShoppingCart" href="/admin/products?stock=low" />)

    const link = screen.getByRole('link', { name: /Low stock/ })
    expect(link).toHaveAttribute('href', '/admin/products?stock=low')
    expect(within(link).getByText('3')).toBeVisible()
  })

  it('marks the icon box with the tone', () => {
    render(<Stat label="Refunds" value={1} icon="ReceiptText" tone="warning" />)

    expect(screen.getByText('1').parentElement).toHaveAttribute('data-tone', 'warning')
  })
})
