import { deleteProduct, updateProduct, useCategories, useDeliveryMethods, useProduct, useSuppliers } from '@/api/queries/catalogue'
import type { ProductFormErrors } from '@/components/admin/product-form'
import type { ProductSpec } from '@/lib/mock-data'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { Breadcrumb } from '@/components/common/breadcrumb'
import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { PageHead } from '@/components/common/page-head'
import { ProductForm } from '@/components/admin/product-form'
import { Sheet } from '@/components/admin/sheet'
import { SubmitButton } from '@/components/forms/submit-button'
import { formatDate, formatPrice } from '@/lib/format'
import { showToast } from '@/lib/toasts'

const DELIVERY_ERROR = 'Choose at least one delivery method.'

/** The fields the mockup's bindProductForm reads and its messages, in the
    order the fields appear in the form, for the focus after a failed save. */
const FIELD_NAMES = ['name', 'price', 'stock', 'supplierId', 'categoryId'] as const

interface EditProductSearch {
  /** The overview's Update stock link opens the form on the Stock field. */
  focus?: string | undefined
}

const validateSearch = (search: Record<string, unknown>): EditProductSearch => ({
  focus: typeof search.focus === 'string' && search.focus !== '' ? search.focus : undefined,
})

/** admin-product-edit: the same form as add, filled with the product's
    values. Submit saving and the visible save validation run here; Delete
    asks for confirmation and removes the product from the catalogue, the
    cart and the wish list. */
export const Route = createFileRoute('/admin/products/$productId/edit')({
  validateSearch,
  component: EditProductScreen,
})

function EditProductScreen() {
  const navigate = useNavigate()
  const { productId } = Route.useParams()
  const { focus } = Route.useSearch()
  const product = useProduct(productId)
  const suppliers = useSuppliers()
  const categories = useCategories()
  const deliveryMethods = useDeliveryMethods()
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [deliveryError, setDeliveryError] = useState<string | undefined>()
  const [confirmDelete, setConfirmDelete] = useState(false)
  /** The field a failed submit asked to focus; focused once its error renders. */
  const pendingFocus = useRef<string | null>(null)

  useEffect(() => {
    if (!product) return
    if (pendingFocus.current) {
      document
        .querySelector<HTMLElement>(`[data-slot=product-form] [name="${pendingFocus.current}"]`)
        ?.focus()
      pendingFocus.current = null
    } else if (focus === 'stock') {
      // The overview's Update stock link opens the form on the Stock field.
      const stock = document.querySelector<HTMLInputElement>('[data-slot=product-form] [name="stock"]')
      stock?.focus()
      stock?.select()
    }
  }, [product, focus, errors, deliveryError])

  if (!product) {
    return (
      <Empty
        icon="PackageX"
        title="This product no longer exists"
        text="It may have been deleted."
        action={<Button label="Back to products" href="/admin/products" />}
      />
    )
  }

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

    const saved = updateProduct(product.id, {
      name,
      description,
      specs,
      price: Number(priceText),
      stock: Number(stockText),
      supplierId,
      categoryId,
      deliveryIds,
    })
    if (!saved) return
    showToast(`${saved.name} saved.`)
    void navigate({ to: '/admin/products', search: { saved: saved.id } })
  }

  const handleDelete = () => {
    deleteProduct(product.id)
    setConfirmDelete(false)
    showToast(`${product.name} deleted.`)
    void navigate({ to: '/admin/products' })
  }

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <Breadcrumb
        items={[{ label: 'Products', href: '/admin/products' }, { label: product.name }]}
      />
      <PageHead title="Edit product" subtitle={`Last changed ${formatDate(product.updated)}`} />
      <ProductForm
        noValidate
        product={{
          name: product.name,
          description: product.description,
          priceCents: product.price * 100,
          stock: product.stock,
          supplierId: product.supplierId,
          categoryId: product.categoryId,
          deliveryIds: product.deliveryIds,
          specs: product.specs.map(([label, value]) => ({ label, value })),
        }}
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
            <SubmitButton label="Save changes" variant="block" />
            <Button label="Cancel" variant="ghost block" href="/admin/products" />
            <Button
              label="Delete product"
              variant="ghost block"
              className="text-danger"
              onClick={() => setConfirmDelete(true)}
            />
          </>
        }
      />
      <Sheet
        title="Delete product"
        open={confirmDelete}
        onOpenChange={(open) => setConfirmDelete(open)}
      >
        <p>
          Delete <strong>{product.name}</strong>? It is removed from the catalogue, the cart and
          the wish list.
        </p>
        <div className="flex justify-end gap-(--sp-2)">
          <Button label="Cancel" variant="ghost" onClick={() => setConfirmDelete(false)} />
          <Button label="Delete product" variant="danger" onClick={handleDelete} />
        </div>
      </Sheet>
    </div>
  )
}
