import { useNavigate } from '@tanstack/react-router'

import { useLogout, useMe } from '@/api/queries/common/auth'
import { AccountMenu } from '@/components/shell/client/account-menu'

export function AccountMenuContainer() {
  const me = useMe()
  const logout = useLogout()
  const navigate = useNavigate()
  const isAdmin = me.data?.role === 'admin'

  const signOut = async () => {
    await logout.mutateAsync()
    await navigate({ to: isAdmin ? '/login' : '/' })
  }

  return <AccountMenu user={me.data} onSignOut={() => void signOut()} />
}
