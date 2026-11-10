import { Link } from '@tanstack/react-router'
import { DropdownMenu } from 'radix-ui'

import type { UserData } from '@/api/generated/types'
import { Icon } from '@/components/ui/icon'

export interface AccountMenuProps {
  user: Pick<UserData, 'name' | 'role'> | null | undefined
  onSignOut: () => void
}

const ITEM_CLASS =
  'flex cursor-pointer items-center gap-2 rounded-(--radius-md) px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-(--surface-2)'

export function AccountMenu({ user, onSignOut }: AccountMenuProps) {
  const isAdmin = user?.role === 'admin'

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
          align="center"
          sideOffset={8}
          collisionPadding={8}
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
                <Link to="/admin" className={ITEM_CLASS}>
                  <Icon name="LayoutDashboard" />
                  <span>Admin area</span>
                </Link>
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item asChild>
                <Link to="/orders" className={ITEM_CLASS}>
                  <Icon name="Receipt" />
                  <span>My orders</span>
                </Link>
              </DropdownMenu.Item>
            )
          ) : (
            <>
              <DropdownMenu.Item asChild>
                <Link to="/login" className={ITEM_CLASS}>
                  <Icon name="LogIn" />
                  <span>Sign in</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to="/register" className={ITEM_CLASS}>
                  <Icon name="UserPlus" />
                  <span>Create account</span>
                </Link>
              </DropdownMenu.Item>
            </>
          )}
          {user ? (
            <>
              <DropdownMenu.Separator className="mx-2 my-1 h-px bg-(--border)" />
              <DropdownMenu.Item onSelect={onSignOut} className={ITEM_CLASS}>
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
