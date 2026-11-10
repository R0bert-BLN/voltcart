import { createFileRoute } from '@tanstack/react-router'

import { AdminDashboardContainer } from '@/containers/admin/admin-dashboard-container'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardContainer,
})
