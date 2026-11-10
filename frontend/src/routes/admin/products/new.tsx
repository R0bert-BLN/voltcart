import { createFileRoute } from '@tanstack/react-router'

import { AdminProductNewContainer } from '@/containers/admin/admin-product-new-container'

export const Route = createFileRoute('/admin/products/new')({
  component: AdminProductNewContainer,
})
