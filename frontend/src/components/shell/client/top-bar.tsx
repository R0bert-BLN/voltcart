import { Brand } from '@/components/shell/common/brand'
import { CountLink } from '@/components/shell/common/nav'

export interface TopBarProps {
  showCounters: boolean
  wishlistCount: number
  cartCount: number
  accountMenu: React.ReactNode
}

export function TopBar({ showCounters, wishlistCount, cartCount, accountMenu }: TopBarProps) {
  return (
    <header
      data-slot="top-bar"
      className="sticky top-0 z-(--z-bars) border-b border-border bg-surface"
    >
      <div className="mx-auto flex h-(--topbar-h) w-full max-w-(--content-w) items-center gap-4 px-6">
        <Brand to="/" />
        <div className="ml-auto flex items-center gap-1">
          {showCounters ? (
            <>
              <CountLink to="/wishlist" icon="Heart" label="Wish list" count={wishlistCount} />
              <CountLink to="/cart" icon="ShoppingCart" label="Cart" count={cartCount} />
            </>
          ) : null}
          {accountMenu}
        </div>
      </div>
    </header>
  )
}
