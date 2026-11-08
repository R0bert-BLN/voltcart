import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** catalog-product: a product's details. */
export const Route = createFileRoute('/products/$productId')({
  component: () => (
    <PlaceholderScreen
      title="Product details"
      text="The product page with its gallery, specs and add-to-cart arrives with the catalogue tickets."
    />
  ),
})
