import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** admin-product-new: the product form. */
export const Route = createFileRoute('/admin/products/new')({
  component: () => (
    <PlaceholderScreen
      title="Add product"
      text="The product form arrives with the add-product ticket."
    />
  ),
})
