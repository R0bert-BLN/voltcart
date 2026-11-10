import { useNavigate } from '@tanstack/react-router'

import { useLogout } from '@/api/queries/common/auth'
import { AdminSidebar } from '@/components/shell/admin/admin-sidebar'

export function AdminSidebarContainer() {
  const logout = useLogout()
  const navigate = useNavigate()

  const signOut = async () => {
    await logout.mutateAsync()
    await navigate({ to: '/login' })
  }

  return <AdminSidebar onSignOut={() => void signOut()} />
}
