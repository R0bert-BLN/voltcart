import { useMe } from '@/api/queries/common/auth'
import { demoAdminName, useAdminOverview } from '@/api/queries/admin/catalogue'
import { AdminDashboardView } from '@/containers/admin/admin-dashboard-view'

export function AdminDashboardContainer() {
  const overview = useAdminOverview()
  const me = useMe()

  return <AdminDashboardView overview={overview} adminName={me.data?.name ?? demoAdminName()} />
}
