import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { routeTree } from '@/routeTree.gen'

const cartResponse = (count: number) => ({
  lines: Array.from({ length: count }, (_, i) => ({
    productId: `p${i}`,
    name: `Product ${i}`,
    priceCents: 100,
    quantity: 1,
    lineTotalCents: 100,
    image: '',
  })),
  subtotalCents: 100 * count,
})

const renderAt = async (path: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient },
  })
  await router.load()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const countBadge = (): HTMLElement | null => document.querySelector('[data-slot="count"]')

describe('CountLink', () => {
  it('shows no badge while the cart is empty', async () => {
    await renderAt('/cart')

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Cart' }).getAttribute('aria-label')).toBe('Cart'),
    )
    expect(countBadge()).toBeNull()
  })

  it.each([
    [3, '3', 'Cart, 3 items'],
    [1, '1', 'Cart, 1 item'],
  ])('shows %i as "%s" with the count in the accessible name', async (count, text, name) => {
    localStorage.setItem('voltcart.auth.token', 'test-token')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(cartResponse(count)), { status: 200 })),
    )
    await renderAt('/cart')

    await waitFor(() => expect(screen.getByRole('link', { name })).toBeInTheDocument())
    expect(countBadge()).toHaveTextContent(text)
  })

  it('caps the badge at 99 like the mockup', async () => {
    localStorage.setItem('voltcart.auth.token', 'test-token')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(cartResponse(150)), { status: 200 })),
    )
    await renderAt('/cart')

    await waitFor(() => expect(countBadge()).toHaveTextContent('99+'))
  })
})
