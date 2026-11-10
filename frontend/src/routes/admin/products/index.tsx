import { createFileRoute } from '@tanstack/react-router'

import { AdminProductsContainer } from '@/containers/admin/admin-products-container'
import { parseAdminProductsSearch } from '@/containers/admin/admin-products-search'

export const Route = createFileRoute('/admin/products/')({
  validateSearch: parseAdminProductsSearch,
  component: AdminProductsContainer,
})
