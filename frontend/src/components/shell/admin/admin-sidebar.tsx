import { Brand } from '@/components/shell/common/brand'
import { NavLink } from '@/components/shell/common/nav'
import { Icon } from '@/components/ui/icon'

export interface AdminSidebarProps {
  onSignOut: () => void
}

export function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  return (
    <aside
      data-slot="admin-sidebar"
      className="sticky top-0 flex h-dvh w-(--sidebar-w) shrink-0 flex-col gap-6 border-r border-border bg-surface p-4"
    >
      <Brand to="/admin" />
      <nav aria-label="Admin navigation" className="flex flex-col gap-1">
        <NavLink to="/admin" icon="LayoutDashboard" label="Overview" exact />
        <NavLink to="/admin/products" icon="Package" label="Products" />
      </nav>
      <nav aria-label="Account" className="mt-auto flex flex-col gap-1">
        <NavLink to="/" icon="Store" label="View store" />
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full cursor-pointer items-center gap-2 rounded-(--radius-md) px-2 py-1.5 text-sm outline-none hover:bg-(--surface-2) focus-visible:ring-2 focus-visible:ring-(--focus)"
        >
          <Icon name="LogOut" />
          <span>Sign out</span>
        </button>
      </nav>
    </aside>
  )
}
