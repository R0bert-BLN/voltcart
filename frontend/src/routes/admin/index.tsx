import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** admin-dashboard: the admin overview. */
export const Route = createFileRoute('/admin/')({
  component: () => (
    <PlaceholderScreen
      title="Overview"
      text="The admin dashboard with its tiles and low-stock list arrives with the admin dashboard ticket."
    />
  ),
})
