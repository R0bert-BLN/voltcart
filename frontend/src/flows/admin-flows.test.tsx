/**
 * Module 3 Product administration, end to end: the overview, the products
 * table and both product forms. The screens run on the local data layer, so
 * the real route tree, shell and router links are exercised without an API
 * stub.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { routeTree } from '@/routeTree.gen'

/** Renders the route through the real router so the links, breadcrumbs and
    the saved-row highlight are exercised; no API stub is needed. */
const renderApp = async (path: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, container: view.container }
}

/** The first link with this href; throws a readable error when missing. */
const linkByHref = (href: string): HTMLElement => {
  const link = document.querySelector(`a[href="${href}"]`)
  if (!(link instanceof HTMLElement)) throw new Error(`no link to ${href}`)
  return link
}

const onScreen = async (name: string) =>
  waitFor(() => expect(screen.getByRole('heading', { level: 1, name })).toBeVisible())

/** The admin navigation inside the shell's sidebar. */
const adminNav = () => within(screen.getByRole('navigation', { name: 'Admin navigation' }))

beforeEach(() => {
  localStorage.clear()
})

describe('admin product flows', () => {
  it('walks every screen of the module in order, and back', async () => {
    const { router } = await renderApp('/admin')
    await onScreen('Overview')

    // Forward: the overview's products tile leads to the table.
    await userEvent.click(linkByHref('/admin/products'))
    await onScreen('Products')

    // On to the add form and back to the list by its breadcrumb.
    await userEvent.click(screen.getByRole('link', { name: 'Add product' }))
    await onScreen('Add product')
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole('link', { name: 'Products' }))
    await onScreen('Products')

    // On to the edit form of one product, again back by the breadcrumb.
    await userEvent.click(screen.getByRole('link', { name: 'Edit Aster Air 14 Laptop' }))
    await onScreen('Edit product')
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole('link', { name: 'Products' }))
    await onScreen('Products')

    // Out of the module: the sidebar returns to the overview.
    await userEvent.click(adminNav().getByRole('link', { name: 'Overview' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin'))
    await onScreen('Overview')
  })

  it('adds a product from the form and returns to the list with it highlighted', async () => {
    const { router, container } = await renderApp('/admin/products')

    await userEvent.click(screen.getByRole('link', { name: 'Add product' }))
    await onScreen('Add product')

    await userEvent.type(screen.getByLabelText('Name'), 'Vantus Desk Lamp')
    await userEvent.type(screen.getByLabelText('Price (€)'), '59.9')
    await userEvent.type(screen.getByLabelText('Stock'), '12')
    await userEvent.selectOptions(screen.getByLabelText('Supplier'), 'northlane')
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'smart-home')
    await userEvent.click(screen.getByRole('checkbox', { name: /Store pickup/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Save product' }))

    // The list keeps the saved row's id in the address and highlights it.
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/products'))
    expect(router.state.location.search).toEqual({ saved: expect.any(String) })
    const row = await waitFor(() => {
      const highlighted = container.querySelector('tr.bg-primary-soft')
      expect(highlighted).not.toBeNull()
      return highlighted as HTMLElement
    })
    expect(row).toHaveTextContent('Vantus Desk Lamp')
    await waitFor(() => expect(screen.getByText('Vantus Desk Lamp added.')).toBeVisible())
  })

  it('saves an edit from the product form and returns to the list with it', async () => {
    const { router, container } = await renderApp('/admin/products')
    await onScreen('Products')

    // A search keeps the table on one page, since the list paginates.
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'Ridge 15')
    await userEvent.click(screen.getByRole('link', { name: 'Edit Ridge 15 Gaming Laptop' }))
    await onScreen('Edit product')
    expect(screen.getByLabelText('Name')).toHaveValue('Ridge 15 Gaming Laptop')

    await userEvent.clear(screen.getByLabelText('Name'))
    await userEvent.type(screen.getByLabelText('Name'), 'Ridge 15 Gaming Laptop, white')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(screen.getByText('Ridge 15 Gaming Laptop, white saved.')).toBeVisible(),
    )
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/products'))
    const row = await waitFor(() => {
      const highlighted = container.querySelector('tr.bg-primary-soft')
      expect(highlighted).not.toBeNull()
      return highlighted as HTMLElement
    })
    expect(row).toHaveTextContent('Ridge 15 Gaming Laptop, white')
  })

  it('deletes a product after confirmation and drops it from the list', async () => {
    const { router, container } = await renderApp('/admin/products')
    await onScreen('Products')

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'Pivot 11')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Pivot 11-in-1 USB-C Dock' }))

    // Cancel keeps the product.
    const dialog = await screen.findByRole('dialog', { name: 'Delete product' })
    expect(dialog).toHaveTextContent('Pivot 11-in-1 USB-C Dock')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()

    // The second time, the confirmation removes it from the catalogue.
    await userEvent.click(screen.getByRole('button', { name: 'Delete Pivot 11-in-1 USB-C Dock' }))
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Delete product' })).getByRole('button', {
        name: 'Delete product',
      }),
    )
    await waitFor(() =>
      expect(screen.getByText('Pivot 11-in-1 USB-C Dock deleted.')).toBeVisible(),
    )
    expect(screen.queryByRole('button', { name: 'Delete Pivot 11-in-1 USB-C Dock' })).toBeNull()
    expect(container.querySelector('[data-slot=result-count]')).toHaveTextContent('0 products')
    expect(router.state.location.pathname).toBe('/admin/products')
  })
})
