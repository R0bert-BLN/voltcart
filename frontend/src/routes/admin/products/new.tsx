import type { ProductFormErrors } from '@/components/admin/product-form'
import { addProduct, useCategories, useDeliveryMethods, useSuppliers } from '@/api/queries/catalogue'
import type { ProductSpec } from '@/lib/mock-data'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { Breadcrumb } from '@/components/common/breadcrumb'
import { Button } from '@/components/common/button'
import { PageHead } from '@/components/common/page-head'
import { ProductForm } from '@/components/admin/product-form'
import { SubmitButton } from '@/components/forms/submit-button'
import { formatPrice } from '@/lib/format'
import { showToast } from '@/lib/toasts'

const DELIVERY_ERROR = 'Choose at least one delivery method.'

/** The fields the mockup's bindProductForm reads and its messages, in the
    order the fields appear in the form, for the focus after a failed save. */
const FIELD_NAMES = ['name', 'price', 'stock', 'supplierId', 'categoryId'] as const

/** admin-product-new: the add form. The shared ProductForm is uncontrolled;
    submit runs the form's validation and saves a new product, which lands on
    the products list with the new row highlighted. */
export const Route = createFileRoute('/admin/products/new')({
  component: AddProductScreen,
})

function AddProductScreen() {
  const navigate = useNavigate()
  const suppliers = useSuppliers()
  const categories = useCategories()
  const deliveryMethods = useDeliveryMethods()
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [deliveryError, setDeliveryError] = useState<string | undefined>()
  /** The field a failed submit asked to focus; focused once its error renders. */
  const pendingFocus = useRef<string | null>(null)

  useEffect(() => {
    if (!pendingFocus.current) return
    document
      .querySelector<HTMLElement>(`[data-slot=product-form] [name="${pendingFocus.current}"]`)
      ?.focus()
    pendingFocus.current = null
  }, [errors, deliveryError])

  // A failed delivery check clears as soon as one method is ticked.
  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement
    if (target.name === 'deliveryIds' && target.checked) setDeliveryError(undefined)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const text = (field: string) => String(data.get(field) ?? '').trim()

    const name = text('name')
    const description = text('description')
    const specs = [...form.querySelectorAll<HTMLInputElement>('[data-slot=spec-row]')]
      .map((row) => [...row.querySelectorAll('input')].map((input) => input.value.trim()))
      .filter((row): row is [string, string] => row[0] !== '' && row[1] !== '')
      .map(([label, value]) => [label, value] as ProductSpec)
    const priceText = text('price')
    const stockText = text('stock')
    const supplierId = text('supplierId')
    const categoryId = text('categoryId')
    const deliveryIds = data.getAll('deliveryIds').map(String)

    const nextErrors: ProductFormErrors = {}
    if (name === '') nextErrors.name = 'Enter a product name.'
    if (priceText === '') nextErrors.price = 'Enter a price.'
    else {
      const price = Number(priceText)
      if (price < 0.01) nextErrors.price = 'Enter 0.01 or more.'
      else if (price > 99999) nextErrors.price = 'Enter 99999 or less.'
    }
    if (stockText === '') nextErrors.stock = 'Enter the units in stock.'
    else if (!Number.isInteger(Number(stockText))) nextErrors.stock = 'Enter a whole number.'
    else if (Number(stockText) > 99999) nextErrors.stock = 'Enter 99999 or less.'
    if (supplierId === '') nextErrors.supplierId = 'Choose a supplier.'
    if (categoryId === '') nextErrors.categoryId = 'Choose a category.'
    setErrors(nextErrors)
    setDeliveryError(deliveryIds.length > 0 ? undefined : DELIVERY_ERROR)

    const firstMissing = FIELD_NAMES.find((field) => nextErrors[field] !== undefined)
    if (firstMissing !== undefined || deliveryIds.length === 0) {
      pendingFocus.current = firstMissing ?? 'deliveryIds'
      return
    }

    const product = addProduct({
      name,
      description,
      specs,
      price: Number(priceText),
      stock: Number(stockText),
      supplierId,
      categoryId,
      deliveryIds,
    })
    showToast(`${product.name} added.`)
    void navigate({ to: '/admin/products', search: { saved: product.id } })
  }

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <Breadcrumb
        items={[{ label: 'Products', href: '/admin/products' }, { label: 'Add product' }]}
      />
      <PageHead title="Add product" />
      <ProductForm
        noValidate
        suppliers={suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name }))}
        categories={categories.map((category) => ({ value: category.id, label: category.name }))}
        deliveryMethods={deliveryMethods.map((method) => ({
          id: method.id,
          label: `${method.name}: ${method.price ? formatPrice(method.price * 100) : 'free'}, ${method.time.toLowerCase()}`,
        }))}
        errors={errors}
        deliveryError={deliveryError}
        onChange={handleChange}
        onSubmit={handleSubmit}
        actions={
          <>
            <SubmitButton label="Save product" variant="block" />
            <Button label="Cancel" variant="ghost block" href="/admin/products" />
          </>
        }
      />
    </div>
  )
}
