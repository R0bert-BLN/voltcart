import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** admin-product-edit: the product form. */
export const Route = createFileRoute('/admin/products/$productId/edit')({
  component: () => (
    <PlaceholderScreen
      title="Edit product"
      text="The product form arrives with the edit-product ticket."
    />
  ),
})
