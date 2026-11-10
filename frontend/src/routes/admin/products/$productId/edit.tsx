import { createFileRoute } from '@tanstack/react-router'

import { AdminProductEditContainer } from '@/containers/admin/admin-product-edit-container'
import { parseEditProductSearch } from '@/containers/admin/admin-products-search'

export const Route = createFileRoute('/admin/products/$productId/edit')({
  validateSearch: parseEditProductSearch,
  component: AdminProductEditContainer,
})
