import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** With category preset, e.g. by the tiles of the store home. */
interface ProductsSearch {
  q?: string
  category?: string
}

/** catalog-list: the product list, reachable from the top bar and the search field. */
export const Route = createFileRoute('/products/')({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => ({
    q: typeof search.q === 'string' && search.q !== '' ? search.q : undefined,
    // The category tiles of the store home deep-link into the list pre-filtered.
    category:
      typeof search.category === 'string' && search.category !== '' ? search.category : undefined,
  }),
  component: () => (
    <PlaceholderScreen
      title="Products"
      text="The product list with its filters and search results arrives with the catalogue tickets."
    />
  ),
})
