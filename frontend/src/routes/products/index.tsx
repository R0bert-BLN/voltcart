import { createFileRoute } from '@tanstack/react-router'

import { ProductListContainer } from '@/containers/client/catalogue/product-list-container'
import { parseProductsSearch } from '@/containers/client/catalogue/products-search'

export const Route = createFileRoute('/products/')({
  validateSearch: parseProductsSearch,
  component: ProductListContainer,
})
