import { Brand } from '@/components/shell/common/brand'

export type AppLayout = 'admin' | 'auth' | 'store'

export interface AppShellProps {
  layout: AppLayout
  topBar: React.ReactNode
  adminSidebar: React.ReactNode
  children: React.ReactNode
}

export function AppShell({ layout, topBar, adminSidebar, children }: AppShellProps) {
  if (layout === 'admin') {
    return (
      <div data-slot="admin-layout" className="flex min-h-dvh">
        {adminSidebar}
        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    )
  }

  if (layout === 'auth') {
    return (
      <div
        data-slot="auth-layout"
        className="mx-auto flex min-h-dvh w-full max-w-(--form-w) flex-col justify-center px-4 py-8"
      >
        <div className="mb-5 flex justify-center">
          <Brand to="/" />
        </div>
        <main>{children}</main>
      </div>
    )
  }

  return (
    <div data-slot="store-layout" className="flex min-h-dvh flex-col">
      {topBar}
      <main className="mx-auto w-full max-w-(--content-w) flex-1 px-6 pt-8 pb-12">{children}</main>
    </div>
  )
}
