import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** admin-products: the products table. */
export const Route = createFileRoute('/admin/products/')({
  component: () => (
    <PlaceholderScreen
      title="Products"
      text="The products table with its columns and bulk actions arrives with the admin products ticket."
    />
  ),
})
