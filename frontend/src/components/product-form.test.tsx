import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'

import { Button } from '@/components/button'
import { ProductForm } from '@/components/product-form'

/** Renders inside a minimal router, for the actions that carry an href. */
const renderForm = async (ui: React.ReactElement) => {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory(),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

const props = {
  suppliers: [{ value: 's1', label: 'Northlane Distribution' }],
  categories: [{ value: 'c1', label: 'Laptops' }],
  deliveryMethods: [
    { id: 'standard', label: 'Standard courier: €4.90, 2 to 4 days' },
    { id: 'pickup', label: 'Store pickup: free, same day' },
  ],
}

const product = {
  name: 'Aster Air 14',
  description: 'A light everyday laptop.',
  priceCents: 114900,
  stock: 18,
  supplierId: 's1',
  categoryId: 'c1',
  deliveryIds: ['pickup'],
  specs: [
    { label: 'Weight', value: '1.2 kg' },
    { label: 'Screen', value: '14 inch' },
  ],
}

describe('ProductForm', () => {
  it('prefills the add and edit fields from the product', () => {
    render(<ProductForm product={product} {...props} />)

    expect(screen.getByLabelText('Name')).toHaveValue('Aster Air 14')
    expect(screen.getByLabelText('Description')).toHaveValue('A light everyday laptop.')
    expect(screen.getByLabelText('Price (€)')).toHaveValue(1149)
    expect(screen.getByLabelText('Stock')).toHaveValue(18)
    expect(screen.getByLabelText('Supplier')).toHaveValue('s1')
    expect(screen.getByLabelText('Category')).toHaveValue('c1')
    expect(screen.getByRole('checkbox', { name: 'Store pickup: free, same day' })).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Standard courier: €4.90, 2 to 4 days' }),
    ).not.toBeChecked()
  })

  it('shows the delivery error when given and not when not', () => {
    const { rerender } = render(<ProductForm {...props} />)

    expect(screen.queryByRole('alert')).toBeNull()

    rerender(<ProductForm {...props} deliveryError="Pick at least one delivery method." />)

    expect(screen.getByRole('alert')).toHaveTextContent('Pick at least one delivery method.')
  })

  it('shows the inline errors under their fields and marks the fields invalid', () => {
    render(
      <ProductForm
        {...props}
        errors={{
          name: 'Enter a product name.',
          price: 'Enter a price.',
          stock: 'Enter the units in stock.',
          supplierId: 'Choose a supplier.',
          categoryId: 'Choose a category.',
        }}
      />,
    )

    expect(screen.getByText('Enter a product name.')).toBeVisible()
    expect(screen.getByText('Enter a price.')).toBeVisible()
    expect(screen.getByText('Enter the units in stock.')).toBeVisible()
    expect(screen.getByText('Choose a supplier.')).toBeVisible()
    expect(screen.getByText('Choose a category.')).toBeVisible()

    for (const name of ['Name', 'Price (€)', 'Stock', 'Supplier', 'Category']) {
      expect(screen.getByLabelText(name)).toBeInvalid()
    }
    // The description takes no error; the delivery group keeps its own alert.
    expect(screen.getByLabelText('Description')).not.toBeInvalid()
    expect(
      screen
        .getAllByRole('alert')
        .filter((alert) => alert.textContent === 'Choose at least one delivery method.'),
    ).toHaveLength(0)
  })

  it('adds and removes specification rows', async () => {
    const user = userEvent.setup()
    render(<ProductForm product={product} {...props} />)

    expect(screen.getAllByLabelText('Specification label')).toHaveLength(2)
    expect(screen.getByDisplayValue('1.2 kg')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Add specification' }))
    expect(screen.getAllByLabelText('Specification label')).toHaveLength(3)

    await user.click(screen.getAllByRole('button', { name: 'Remove this specification' })[0])
    expect(screen.getAllByLabelText('Specification label')).toHaveLength(2)
    expect(screen.queryByDisplayValue('1.2 kg')).toBeNull()
    expect(screen.getByDisplayValue('14 inch')).toBeVisible()
  })

  it('starts a new product with one empty specification row', () => {
    render(<ProductForm {...props} />)

    expect(screen.getAllByLabelText('Specification label')).toHaveLength(1)
    expect(screen.getByLabelText('Specification label')).toHaveValue('')
  })

  it('renders the actions in the aside and fires the submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      event.currentTarget.checkValidity()
    })
    await renderForm(
      <ProductForm
        product={product}
        {...props}
        actions={
          <>
            <Button label="Save changes" type="submit" />
            <Button label="View in store" variant="secondary" href="/catalog/p1" />
          </>
        }
        onSubmit={onSubmit}
      />,
    )
    const aside = screen.getByRole('button', { name: 'Save changes' }).closest('aside')
    expect(aside).not.toBeNull()
    expect(within(aside!).getByRole('link', { name: 'View in store' })).toHaveAttribute(
      'href',
      '/catalog/p1',
    )

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
