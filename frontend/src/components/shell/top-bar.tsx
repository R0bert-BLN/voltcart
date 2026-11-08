import { type FormEvent } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'

import { useCart } from '@/api/queries/cart'
import { useMe } from '@/api/queries/auth'
import { useWishlist } from '@/api/queries/wishlist'
import { AccountMenu } from '@/components/shell/account-menu'
import { Brand } from '@/components/shell/brand'
import { CountLink, NavLink } from '@/components/shell/nav'
import { Icon } from '@/components/ui/icon'

/** Store top bar from the mockup (.topbar): brand, main navigation, product
    search and, unless the visitor is an admin, the wish list and cart counters. */
export function TopBar() {
  const me = useMe()
  const cart = useCart()
  const wishlist = useWishlist()
  const navigate = useNavigate()
  const search = useRouterState({ select: (state) => state.location.search })
  const query = typeof search.q === 'string' ? search.q : ''

  const isAdmin = me.data?.role === 'admin'

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    void navigate({ to: '/products', search: { q: q === '' ? undefined : q } })
  }

  return (
    <header
      data-slot="top-bar"
      className="sticky top-0 z-(--z-bars) border-b border-border bg-surface"
    >
      <div className="mx-auto flex h-(--topbar-h) w-full max-w-(--content-w) items-center gap-4 px-6">
        <Brand to="/" />
        <nav aria-label="Main navigation">
          <NavLink to="/products" label="All products" />
        </nav>
        <form role="Search" onSubmit={submit} className="ml-auto min-w-0 max-w-(--search-w) flex-1">
          <label className="relative flex items-center">
            <Icon name="Search" className="absolute left-3 pointer-events-none" />
            <input
              type="Search"
              name="q"
              defaultValue={query}
              placeholder="Search products"
              aria-label="Search products"
              className="h-(--control) w-full rounded-(--radius-pill) border border-border bg-(--surface-2) pr-3 pl-9 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--focus) focus:bg-surface focus:ring-2 focus:ring-(--focus)"
            />
          </label>
        </form>
        <div className="flex items-center gap-1">
          {isAdmin ? null : (
            <>
              <CountLink to="/wishlist" icon="Heart" label="Wish list" count={wishlist.data?.length ?? 0} />
              <CountLink to="/cart" icon="ShoppingCart" label="Cart" count={cart.data?.lines.length ?? 0} />
            </>
          )}
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
