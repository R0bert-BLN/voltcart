import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { products, users } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
import { routeTree } from '@/routeTree.gen'

/** Renders the route through the real router so the links and the saved
    highlight are exercised; the form runs on the local data layer, so no API
    stub is needed. */
const renderRoute = async (path: string) => {
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

describe('admin edit-product screen', () => {
  it('opens the product form filled with the product\'s values, with the last-changed date and the three actions', async () => {
    const product = products.find((candidate) => candidate.id === 'lp-aster-14')!

    await renderRoute(`/admin/products/${product.id}/edit`)

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(breadcrumb).toHaveTextContent('Products')
    expect(breadcrumb).toHaveTextContent(product.name)

    expect(screen.getByRole('heading', { level: 1, name: 'Edit product' })).toBeVisible()
    expect(screen.getByText(`Last changed ${formatDate(product.updated)}`)).toBeVisible()

    expect(screen.getByLabelText<HTMLInputElement>('Name')).toBeVisible()
    expect(screen.getByLabelText('Name')).toHaveValue(product.name)
    expect(screen.getByLabelText('Description')).toHaveValue(product.description)
    expect(screen.getByLabelText('Price (€)')).toHaveValue(product.price)
    expect(screen.getByLabelText('Stock')).toHaveValue(product.stock)
    expect(screen.getByRole('combobox', { name: 'Supplier' })).toHaveValue(product.supplierId)
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue(product.categoryId)
    for (const method of product.deliveryIds) {
      expect(screen.getByRole('checkbox', { name: new RegExp(method, 'i') })).toBeChecked()
    }
    for (const [label, value] of product.specs) {
      expect(screen.getByDisplayValue(label)).toBeVisible()
      expect(screen.getByDisplayValue(value)).toBeVisible()
    }

    // Save, Cancel and Delete sit in the sticky aside; Cancel returns to the list.
    const aside = screen.getByRole('button', { name: 'Save changes' }).closest('aside')!
    expect(within(aside).getByRole('button', { name: 'Save changes' })).toBeVisible()
    expect(within(aside).getByRole('link', { name: 'Cancel' })).toHaveAttribute(
      'href',
      '/admin/products',
    )
    expect(within(aside).getByRole('button', { name: 'Delete product' })).toBeVisible()
  })

  it('shows an empty state for a product the data layer does not know', async () => {
    await renderRoute('/admin/products/does-not-exist/edit')

    expect(screen.getByText('This product no longer exists')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to products' })).toHaveAttribute(
      'href',
      '/admin/products',
    )
  })

  it('opens on the Stock field when the overview links in with focus=stock', async () => {
    await renderRoute(`/admin/products/lp-aster-14/edit?focus=stock`)

    await waitFor(() => expect(screen.getByLabelText('Stock')).toHaveFocus())
  })

  it('shows the same validation messages as the add form and focuses the first missing field', async () => {
    await renderRoute('/admin/products/lp-aster-14/edit')

    const user = userEvent.setup()
    await user.clear(screen.getByLabelText('Name'))
    await user.clear(screen.getByLabelText('Price (€)'))
    await user.clear(screen.getByLabelText('Stock'))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByText('Enter a product name.')).toBeVisible()
    expect(screen.getByText('Enter a price.')).toBeVisible()
    expect(screen.getByText('Enter the units in stock.')).toBeVisible()
    expect(screen.getByLabelText('Name')).toHaveFocus()
  })

  it('saves the edit and returns to the list with a toast and the row highlighted', async () => {
    const { container, router } = await renderRoute('/admin/products/lp-aster-14/edit')

    const user = userEvent.setup()
    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Aster Air 14i Laptop')
    await user.clear(screen.getByLabelText('Price (€)'))
    await user.type(screen.getByLabelText('Price (€)'), '1199')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByText('Aster Air 14i Laptop saved.')).toBeVisible()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Products' })).toBeVisible(),
    )
    await waitFor(() => expect(container.querySelector('tr.bg-primary-soft')).not.toBeNull())
    expect(container.querySelector('tr.bg-primary-soft')).toHaveTextContent('Aster Air 14i Laptop')

    // The change is visible in the catalogue, until the page reloads.
    await router.navigate({ to: '/products' })
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'All products' })).toBeVisible(),
    )
    expect(screen.getByText('Aster Air 14i Laptop')).toBeVisible()
  })

  it('deletes the product through a dialog that names it, also from the cart and wish list', async () => {
    const doomed = products.find((candidate) => candidate.id === 'ac-kite-mouse')!
    const client = users.find((user) => user.id === 'u-client')!
    client.wishlist = [doomed.id]
    client.cart = [{ id: doomed.id, qty: 2 }]

    const { router } = await renderRoute(`/admin/products/${doomed.id}/edit`)

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }))

    const dialog = screen.getByRole('dialog', { name: 'Delete product' })
    expect(dialog).toBeVisible()
    expect(within(dialog).getByText(doomed.name)).toBeVisible()

    // Cancel keeps the product on the form.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByLabelText('Name')).toHaveValue(doomed.name)

    await userEvent.click(screen.getByRole('button', { name: 'Delete product' }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Delete product' })).getByRole('button', {
        name: 'Delete product',
      }),
    )

    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(screen.getByText(`${doomed.name} deleted.`)).toBeVisible())
    expect(client.cart).toHaveLength(0)
    expect(client.wishlist).toHaveLength(0)

    await router.navigate({ to: `/admin/products/${doomed.id}/edit` })
    await waitFor(() => expect(screen.getByText('This product no longer exists')).toBeVisible())
  })
})
