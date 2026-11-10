import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { deleteProduct, updateProduct } from '@/api/queries/admin/catalogue'
import {
  useCategories,
  useDeliveryMethods,
  useProduct,
  useSuppliers,
} from '@/api/queries/common/catalogue'
import { ProductEditorView } from '@/components/views/admin/product-editor-view'
import { ProductGoneState } from '@/components/views/common/states'
import { useProductForm } from '@/containers/admin/use-product-form'
import { focusField } from '@/lib/focus'
import { toFormValues } from '@/lib/admin/product-form'
import { showToast } from '@/lib/toasts'

const route = getRouteApi('/admin/products/$productId/edit')

export function AdminProductEditContainer() {
  const navigate = useNavigate()
  const { productId } = route.useParams()
  const { focus } = route.useSearch()
  const product = useProduct(productId)
  const suppliers = useSuppliers()
  const categories = useCategories()
  const deliveryMethods = useDeliveryMethods()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const form = useProductForm((input) => {
    const saved = updateProduct(productId, input)
    if (!saved) return
    showToast(`${saved.name} saved.`)
    void navigate({ to: '/admin/products', search: { saved: saved.id } })
  })

  const productExists = product !== undefined
  useEffect(() => {
    if (productExists && focus === 'stock') focusField('stock', { select: true })
  }, [productExists, focus])

  if (!product) return <ProductGoneState />

  const handleDelete = () => {
    deleteProduct(product.id)
    setConfirmingDelete(false)
    showToast(`${product.name} deleted.`)
    void navigate({ to: '/admin/products' })
  }

  return (
    <ProductEditorView
      title="Edit product"
      submitLabel="Save changes"
      product={toFormValues(product)}
      suppliers={suppliers}
      categories={categories}
      deliveryMethods={deliveryMethods}
      errors={form.errors}
      deliveryError={form.deliveryError}
      deletion={{
        productName: product.name,
        open: confirmingDelete,
        onRequest: () => setConfirmingDelete(true),
        onCancel: () => setConfirmingDelete(false),
        onConfirm: handleDelete,
      }}
      onChange={form.handleChange}
      onSubmit={form.handleSubmit}
    />
  )
}
