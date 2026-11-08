import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { routeTree } from '@/routeTree.gen'

/** Renders the route through the real router so the navigation and the saved
    highlight are exercised; the form runs on the local data layer. */
const renderRoute = async (path = '/admin/products/new') => {
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

const fillValidProduct = async (name = 'Vantus Desk Lamp') => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Name'), name)
  await user.type(screen.getByLabelText('Price (€)'), '59.9')
  await user.type(screen.getByLabelText('Stock'), '12')
  await user.selectOptions(screen.getByLabelText('Supplier'), 'northlane')
  await user.selectOptions(screen.getByLabelText('Category'), 'smart-home')
  await user.click(screen.getByRole('checkbox', { name: /Store pickup/ }))
  return user
}

/** Waits for the form's save to land on the products list. */
const onProductsList = async () => {
  await waitFor(() =>
    expect(screen.getByRole('heading', { level: 1, name: 'Products' })).toBeVisible(),
  )
}

describe('admin add-product screen', () => {
  it('shows the breadcrumb, the head and the form sections in order', async () => {
    const { container } = await renderRoute()

    const breadcrumb = container.querySelector('[data-slot=breadcrumb]')!
    const head = container.querySelector('[data-slot=page-head]')!
    const form = container.querySelector('[data-slot=product-form]')!
    expect(breadcrumb).toHaveTextContent('Products')
    expect(head).toHaveTextContent('Add product')
    expect(breadcrumb.compareDocumentPosition(head) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(head.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    // The four sections of the mockup, in order.
    const sections = [...form.querySelectorAll('[data-slot=card] h2')].map((h2) => h2.textContent)
    expect(sections).toEqual([
      'Product details',
      'Specifications',
      'Price and stock',
      'Supply and delivery',
    ])
    // The delivery group holds every method of the data layer.
    expect(form.querySelectorAll('[data-slot=filter-check]')).toHaveLength(3)
    expect(screen.getByRole('checkbox', { name: 'Standard courier: €4.90, 2 to 4 days' })).toBeVisible()
    expect(screen.getByRole('checkbox', { name: 'Express courier: €9.90, next working day' })).toBeVisible()
    expect(screen.getByRole('checkbox', { name: 'Store pickup: free, same day' })).toBeVisible()

    // Save and Cancel sit in the sticky aside; Cancel returns to the list.
    const aside = screen.getByRole('button', { name: 'Save product' }).closest('aside')!
    expect(aside.querySelector('a')?.getAttribute('href')).toBe('/admin/products')
  })

  it('shows an error under every missing required field and focuses the first', async () => {
    const { container } = await renderRoute()

    await userEvent.click(screen.getByRole('button', { name: 'Save product' }))

    expect(container.querySelector('[data-slot=product-form]')).toHaveTextContent(
      'Enter a product name.',
    )
    expect(screen.getByText('Enter a price.')).toBeVisible()
    expect(screen.getByText('Enter the units in stock.')).toBeVisible()
    expect(screen.getByText('Choose a supplier.')).toBeVisible()
    expect(screen.getByText('Choose a category.')).toBeVisible()
    expect(screen.getByText('Choose at least one delivery method.')).toBeVisible()
    expect(screen.getByLabelText('Name')).toHaveFocus()
  })

  it('validates the number ranges and the whole-number stock', async () => {
    const { container } = await renderRoute()
    const user = await fillValidProduct()
    await user.clear(screen.getByLabelText('Price (€)'))
    await user.type(screen.getByLabelText('Price (€)'), '0')
    await user.clear(screen.getByLabelText('Stock'))
    await user.type(screen.getByLabelText('Stock'), '3.5')
    await user.click(screen.getByRole('button', { name: 'Save product' }))

    expect(screen.getByText('Enter 0.01 or more.')).toBeVisible()
    expect(screen.getByText('Enter a whole number.')).toBeVisible()

    await user.clear(screen.getByLabelText('Price (€)'))
    await user.type(screen.getByLabelText('Price (€)'), '100000')
    await user.click(screen.getByRole('button', { name: 'Save product' }))
    expect(container.querySelector('[data-slot=product-form]')).toHaveTextContent(
      'Enter 99999 or less.',
    )
  })

  it('keeps the delivery error until a method is picked', async () => {
    const user = userEvent.setup()
    await renderRoute()

    await user.type(screen.getByLabelText('Name'), 'Vantus Desk Lamp')
    await user.type(screen.getByLabelText('Price (€)'), '59.9')
    await user.type(screen.getByLabelText('Stock'), '12')
    await user.selectOptions(screen.getByLabelText('Supplier'), 'northlane')
    await user.selectOptions(screen.getByLabelText('Category'), 'smart-home')
    await user.click(screen.getByRole('button', { name: 'Save product' }))

    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one delivery method.')
    // The first delivery checkbox holds the focus after the failed save.
    expect(screen.getByRole('checkbox', { name: /Standard courier/ })).toHaveFocus()

    await user.click(screen.getByRole('checkbox', { name: /Store pickup/ }))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('saves the product and returns to the list with a toast and the row highlighted', async () => {
    const { container } = await renderRoute()
    await fillValidProduct()
    await userEvent.click(screen.getByRole('button', { name: 'Save product' }))
    await onProductsList()

    expect(screen.getByText('Vantus Desk Lamp added.')).toBeVisible()
    // The new row is highlighted, on the page the list opened for it.
    await waitFor(() => expect(container.querySelector('tr.bg-primary-soft')).not.toBeNull())
    expect(container.querySelector('tr.bg-primary-soft')).toHaveTextContent('Vantus Desk Lamp')
  })

  it('makes the new product visible in the catalogue, until the page reloads', async () => {
    const { router } = await renderRoute()
    await fillValidProduct('Rask USB-C Cable')
    await userEvent.click(screen.getByRole('button', { name: 'Save product' }))
    await onProductsList()

    await router.navigate({ to: '/products' })
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'All products' })).toBeVisible(),
    )
    expect(document.body).toHaveTextContent('Rask USB-C Cable')
  })

  it('does not save a spec row that is missing its label or value', async () => {
    const { container } = await renderRoute()
    const user = await fillValidProduct('Pairing Test Lamp')
    await user.type(screen.getByLabelText('Specification label'), 'Weight')
    // The value input of the first row stays empty, so the row is dropped.
    await user.click(screen.getByRole('button', { name: 'Save product' }))
    await onProductsList()

    await waitFor(() => expect(container.querySelector('tr.bg-primary-soft')).not.toBeNull())
    expect(container.querySelector('tr.bg-primary-soft')).toHaveTextContent('Pairing Test Lamp')
  })
})
