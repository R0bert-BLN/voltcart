import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** catalog-home: the store home. */
export const Route = createFileRoute('/')({
  component: () => (
    <PlaceholderScreen
      title="Store home"
      text="The store home with its category tiles and popular products arrives with the catalogue tickets."
    />
  ),
})
