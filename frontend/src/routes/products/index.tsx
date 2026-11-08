import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** catalog-list: the product list, reachable from the top bar and the search field. */
export const Route = createFileRoute('/products/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' && search.q !== '' ? search.q : undefined,
  }),
  component: () => (
    <PlaceholderScreen
      title="Products"
      text="The product list with its filters and search results arrives with the catalogue tickets."
    />
  ),
})
