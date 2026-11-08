import { DropdownMenu } from 'radix-ui'
import { Link, useNavigate } from '@tanstack/react-router'

import { useLogout, useMe } from '@/api/queries/auth'
import { Icon } from '@/components/ui/icon'

const itemClasses =
  'flex cursor-pointer items-center gap-2 rounded-(--radius-md) px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-(--surface-2)'

/** Account menu from the mockup (.menu): the user icon opens a panel with the
    account name and, per role, the account links or actions. */
export function AccountMenu() {
  const me = useMe()
  const logout = useLogout()
  const navigate = useNavigate()
  const user = me.data
  const isAdmin = user?.role === 'admin'

  const signOut = async () => {
    await logout.mutateAsync()
    // A client lands on the store home as a guest; an admin lands on the sign-in screen.
    await navigate({ to: isAdmin ? '/login' : '/' })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={user ? `Account: ${user.name}` : 'Account'}
        data-slot="account-menu"
        className="grid size-9 place-items-center rounded-(--radius-md) text-(--text-muted) outline-none hover:bg-(--surface-2) hover:text-(--text) data-[state=open]:bg-(--surface-2) focus-visible:ring-2 focus-visible:ring-(--focus)"
      >
        <Icon name="User" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-(--z-menu) flex min-w-(--menu-w) flex-col gap-0.5 rounded-(--radius-lg) border border-border bg-surface p-2 shadow-md"
        >
          {user ? (
            <DropdownMenu.Label className="px-2 py-1 text-xs font-medium text-(--text-muted)">
              {user.name}
            </DropdownMenu.Label>
          ) : null}
          {user ? (
            isAdmin ? (
              <DropdownMenu.Item asChild>
                <Link to="/admin" className={itemClasses}>
                  <Icon name="LayoutDashboard" />
                  <span>Admin area</span>
                </Link>
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item asChild>
                <Link to="/orders" className={itemClasses}>
                  <Icon name="Receipt" />
                  <span>My orders</span>
                </Link>
              </DropdownMenu.Item>
            )
          ) : (
            <>
              <DropdownMenu.Item asChild>
                <Link to="/login" className={itemClasses}>
                  <Icon name="LogIn" />
                  <span>Sign in</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to="/register" className={itemClasses}>
                  <Icon name="UserPlus" />
                  <span>Create account</span>
                </Link>
              </DropdownMenu.Item>
            </>
          )}
          {user ? (
            <>
              <DropdownMenu.Separator className="mx-2 my-1 h-px bg-(--border)" />
              <DropdownMenu.Item onSelect={() => void signOut()} className={itemClasses}>
                <Icon name="LogOut" />
                <span>Sign out</span>
              </DropdownMenu.Item>
            </>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
