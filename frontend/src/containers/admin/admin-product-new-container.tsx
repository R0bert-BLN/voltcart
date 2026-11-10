import { useNavigate } from '@tanstack/react-router'

import { addProduct } from '@/api/queries/admin/catalogue'
import { useCategories, useDeliveryMethods, useSuppliers } from '@/api/queries/common/catalogue'
import { ProductEditorView } from '@/containers/admin/product-editor-view'
import { useProductForm } from '@/containers/admin/use-product-form'
import { showToast } from '@/lib/toasts'

export function AdminProductNewContainer() {
  const navigate = useNavigate()
  const suppliers = useSuppliers()
  const categories = useCategories()
  const deliveryMethods = useDeliveryMethods()

  const form = useProductForm((input) => {
    const product = addProduct(input)
    showToast(`${product.name} added.`)
    void navigate({ to: '/admin/products', search: { saved: product.id } })
  })

  return (
    <ProductEditorView
      title="Add product"
      submitLabel="Save product"
      suppliers={suppliers}
      categories={categories}
      deliveryMethods={deliveryMethods}
      errors={form.errors}
      deliveryError={form.deliveryError}
      onChange={form.handleChange}
      onSubmit={form.handleSubmit}
    />
  )
}
