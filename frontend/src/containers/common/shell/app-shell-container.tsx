import { Outlet, useRouterState } from '@tanstack/react-router'

import { AppShell, type AppLayout } from '@/components/shell/common/app-shell'
import { AdminSidebarContainer } from '@/containers/admin/admin-sidebar-container'
import { TopBarContainer } from '@/containers/client/shell/top-bar-container'

const AUTH_PATHS = ['/login', '/register']

const layoutFor = (pathname: string): AppLayout => {
  if (pathname.startsWith('/admin')) return 'admin'
  return AUTH_PATHS.includes(pathname) ? 'auth' : 'store'
}

export function AppShellContainer() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <AppShell
      layout={layoutFor(pathname)}
      topBar={<TopBarContainer />}
      adminSidebar={<AdminSidebarContainer />}
    >
      <Outlet />
    </AppShell>
  )
}
