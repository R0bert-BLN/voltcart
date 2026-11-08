import { Outlet, useRouterState } from '@tanstack/react-router'

import { AdminSidebar } from '@/components/shell/admin-sidebar'
import { Brand } from '@/components/shell/brand'
import { TopBar } from '@/components/shell/top-bar'

/** Chooses the shell per role and device (brief, Navigation): the admin
    sidebar takes over on the admin screens, the sign-in screens carry only the
    brand, everything else gets the store top bar. */
export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  if (pathname.startsWith('/admin')) {
    return (
      <div data-slot="admin-layout" className="flex min-h-dvh">
        <AdminSidebar />
        <main className="min-w-0 flex-1 p-8">
          <Outlet />
        </main>
      </div>
    )
  }

  if (pathname === '/login' || pathname === '/register') {
    return (
      <div data-slot="auth-layout" className="mx-auto w-full max-w-(--form-w) px-4 py-8">
        <div className="mb-5 flex justify-center">
          <Brand to="/" />
        </div>
        <main>
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div data-slot="store-layout" className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-(--content-w) flex-1 px-6 pt-8 pb-12">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-(--content-w) gap-4 px-6 py-5 text-sm text-(--text-muted)">
          <span>Prices include VAT.</span>
        </div>
      </footer>
    </div>
  )
}
