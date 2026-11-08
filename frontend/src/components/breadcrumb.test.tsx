import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'

import { Breadcrumb } from '@/components/breadcrumb'

/** Renders inside a minimal router, since earlier items are router links. */
const renderTrail = async (ui: React.ReactElement) => {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory(),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

describe('Breadcrumb', () => {
  const items = [
    { label: 'Catalog', href: '/catalog' },
    { label: 'Laptops', href: '/catalog/laptops' },
    { label: 'Volt Air 14' },
  ]

  it('renders an accessible trail of links', async () => {
    await renderTrail(<Breadcrumb items={items} />)

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav).toBeVisible()
    expect(screen.getByRole('link', { name: 'Catalog' })).toHaveAttribute('href', '/catalog')
    expect(screen.getByRole('link', { name: 'Laptops' })).toHaveAttribute('href', '/catalog/laptops')
  })

  it('marks the last item as the current page, not a link', async () => {
    await renderTrail(<Breadcrumb items={items} />)

    const current = screen.getByText('Volt Air 14')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Volt Air 14' })).toBeNull()
  })

  it('separates the earlier items with chevron icons', async () => {
    await renderTrail(<Breadcrumb items={items} />)

    const separators = document.querySelectorAll('[data-slot="breadcrumb"] [data-icon="ChevronRight"]')
    expect(separators).toHaveLength(items.length - 1)
  })

  it('renders an item without a href as plain text before the current page', async () => {
    await renderTrail(
      <Breadcrumb
        items={[
          { label: 'Catalog', href: '/catalog' },
          { label: 'Laptops' },
          { label: 'Volt Air 14' },
        ]}
      />,
    )

    expect(screen.getByText('Laptops').tagName).toBe('SPAN')
    expect(screen.queryByRole('link', { name: 'Laptops' })).toBeNull()
  })
})
