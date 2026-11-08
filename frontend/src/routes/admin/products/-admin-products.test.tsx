import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { categories, products, suppliers, users } from '@/lib/mock-data'
import { routeTree } from '@/routeTree.gen'

/** Renders the route through the real router so the links are exercised.
    Without a token the account queries stay disabled, so no API stub is
    needed; the table runs on the local data layer. */
const renderRoute = async (path = '/admin/products') => {
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

const supplierName = (id: string) => suppliers.find((supplier) => supplier.id === id)!.name
const categoryName = (id: string) => categories.find((category) => category.id === id)!.name

const countOf = async (container: HTMLElement, text: string) =>
  waitFor(() => expect(container.querySelector('[data-slot=result-count]')!.textContent).toBe(text))

describe('admin products screen', () => {
  it('shows the head with the add-product action and the toolbar filters', async () => {
    await renderRoute()

    expect(screen.getByRole('heading', { level: 1, name: 'Products' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Add product' })).toHaveAttribute(
      'href',
      '/admin/products/new',
    )
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Stock' })).toBeVisible()
    // The category filter holds every category of the data layer.
    const category = screen.getByRole('combobox', { name: 'Category' })
    const options = within(category).getAllByRole('option')
    expect(options).toHaveLength(categories.length + 1)
    expect(options[0]).toHaveTextContent('All categories')
    options.slice(1).forEach((option, index) => {
      expect(option).toHaveTextContent(categories[index]!.name)
    })
  })

  it('opens on the stock level the dashboard tiles link in', async () => {
    const { container } = await renderRoute('/admin/products?stock=low')

    expect(screen.getByRole('combobox', { name: 'Stock' })).toHaveValue('low')
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5)
    await countOf(container, `${lowStock.length} products`)
  })

  it('shows one row per product with its cells from the data, in order', async () => {
    const { container } = await renderRoute()

    expect(screen.getByText(`${products.length} products`)).toBeVisible()

    const rows = [...container.querySelectorAll('tbody tr')]
    expect(rows).toHaveLength(10)
    const first = products[0]!
    const cells = [...rows[0]!.querySelectorAll('td')].map((cell) => cell.textContent)
    expect(cells[0]).toContain(first.name)
    expect(rows[0]!.querySelector('a')?.getAttribute('href')).toBe(
      `/admin/products/${first.id}/edit`,
    )
    expect(cells[1]).toBe(categoryName(first.categoryId))
    expect(cells[2]).toMatch(`€${first.price.toLocaleString('en-IE')}`)
    expect(cells[3]).toContain(String(first.stock))
    expect(cells[3]).toContain('In stock')
    expect(cells[4]).toBe(supplierName(first.supplierId))
    expect(screen.getByRole('link', { name: `Edit ${first.name}` })).toBeVisible()
    expect(screen.getByRole('button', { name: `Delete ${first.name}` })).toBeVisible()
  })

  it('keeps the head, toolbar, count and table in the order of the mockup', async () => {
    const { container } = await renderRoute()

    const head = container.querySelector('[data-slot=page-head]')!
    const toolbar = screen.getByRole('form')
    const count = container.querySelector('[data-slot=result-count]')!
    const table = container.querySelector('[data-slot=table-wrap]')!
    expect(head.compareDocumentPosition(toolbar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(toolbar.compareDocumentPosition(count) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(count.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('narrows the table with the search, through category and supplier names too', async () => {
    const user = userEvent.setup()
    const { container } = await renderRoute()

    // The supplier's name finds its products.
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'northlane')
    await countOf(container, `${products.filter((product) => product.supplierId === 'northlane').length} products`)

    // A term nothing matches shows the empty state with a clear action.
    await user.clear(screen.getByRole('searchbox', { name: 'Search' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'nothing matches this')
    await countOf(container, '0 products')
    expect(screen.getByRole('heading', { name: 'No products match' })).toBeVisible()
    expect(container.querySelector('[data-slot=table-wrap]')).toBeNull()
  })

  it('narrows the table with the stock and category filters, and clears them', async () => {
    const user = userEvent.setup()
    const { container } = await renderRoute()

    await user.selectOptions(screen.getByRole('combobox', { name: 'Stock' }), 'out')
    await countOf(container, `${products.filter((product) => product.stock <= 0).length} products`)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'laptops')
    await countOf(container, '0 products')

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    await countOf(container, `${products.length} products`)
    expect(screen.getByRole('combobox', { name: 'Stock' })).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('')
  })

  it('paginates the table', async () => {
    const { container } = await renderRoute()

    // 22 products give three pages; the pagination holds prev, 1 to 3, next.
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getAllByRole('button')).toHaveLength(5)

    await userEvent.click(within(nav).getByRole('button', { name: '3' }))
    await waitFor(() => {
      const rows = [...container.querySelectorAll('tbody tr')]
      expect(rows).toHaveLength(products.length - 20)
    })
  })

  it('highlights the row the form just saved, on its page', async () => {
    const { container } = await renderRoute('/admin/products?saved=lp-fernbook-13')

    const highlighted = container.querySelector('tr.bg-primary-soft')
    expect(highlighted).not.toBeNull()
    expect(highlighted).toHaveTextContent('Fernbook 13 Laptop')
  })

  it('deletes a product through the confirmation dialog, with a toast', async () => {
    // Keep the demo records stable for the tests above; deletions persist for
    // the rest of the file. An out-of-stock product sits on the first page.
    const doomed = products.find((product) => product.stock <= 0)!
    const client = users.find((user) => user.id === 'u-client')!
    client.wishlist = ['au-halden-nc']
    client.cart = [{ id: doomed.id, qty: 2 }]

    const { container } = await renderRoute()

    await userEvent.click(screen.getByRole('button', { name: `Delete ${doomed.name}` }))

    const dialog = screen.getByRole('dialog', { name: 'Delete product' })
    expect(dialog).toBeVisible()
    expect(within(dialog).getByText(doomed.name)).toBeVisible()

    // Cancel keeps the product.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText(`${products.length} products`)).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: `Delete ${doomed.name}` }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Delete product' })).getByRole('button', {
        name: 'Delete product',
      }),
    )

    expect(screen.queryByRole('dialog')).toBeNull()
    await countOf(container, `${products.length - 1} products`)
    expect(container.querySelector('tbody')).not.toHaveTextContent(doomed.name)
    expect(screen.getByText(`${doomed.name} deleted.`)).toBeVisible()
  })

  it('removes a deleted product from the demo cart and wish list, and from the catalogue', async () => {
    const doomed = products.find((product) => product.id === 'au-halden-nc')!
    const client = users.find((user) => user.id === 'u-client')!
    client.wishlist = ['au-halden-nc']
    client.cart = [{ id: 'au-halden-nc', qty: 2 }]

    const { router } = await renderRoute('/admin/products')

    await userEvent.click(screen.getByRole('button', { name: `Delete ${doomed.name}` }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Delete product' })).getByRole('button', {
        name: 'Delete product',
      }),
    )

    expect(client.cart).toHaveLength(0)
    expect(client.wishlist).toHaveLength(0)
    // The change is visible in the catalogue: the store's product list no
    // longer shows the product.
    await router.navigate({ to: '/products' })
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('Products'),
    )
    expect(screen.queryByText(doomed.name)).toBeNull()
  })
})
