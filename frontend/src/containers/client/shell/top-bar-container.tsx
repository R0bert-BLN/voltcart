import { useMe } from '@/api/queries/common/auth'
import { useCart } from '@/api/queries/client/cart'
import { useWishlist } from '@/api/queries/client/wishlist'
import { TopBar } from '@/components/shell/client/top-bar'
import { AccountMenuContainer } from '@/containers/client/shell/account-menu-container'

export function TopBarContainer() {
  const me = useMe()
  const cart = useCart()
  const wishlist = useWishlist()

  return (
    <TopBar
      showCounters={me.data?.role !== 'admin'}
      wishlistCount={wishlist.data?.length ?? 0}
      cartCount={cart.data?.lines.length ?? 0}
      accountMenu={<AccountMenuContainer />}
    />
  )
}
