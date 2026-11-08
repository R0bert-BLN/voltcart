import { Link, type LinkProps } from '@tanstack/react-router'

import { cn } from 'cn'
import { Icon, type IconName } from '@/components/ui/icon'

export interface CountLinkProps {
  to: LinkProps["to"]
  icon: IconName
  /** Accessible name; the count is appended when there is one. */
  label: string
  count: number
}

/** Top-bar counter from the mockup (.icon-btn.icon-count): an icon link with a
    small count badge that only shows above zero (99+ caps, like the mockup). */
export function CountLink({ to, icon, label, count }: CountLinkProps) {
  return (
    <Link
      to={to}
      aria-label={count > 0 ? `${label}, ${count} ${count === 1 ? 'item' : 'items'}` : label}
      className="relative grid size-9 place-items-center rounded-(--radius-md) text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text)"
    >
      <Icon name={icon} />
      {count > 0 ? (
        <span
          data-slot="count"
          className="absolute top-0 right-0 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-(--text-on-primary) tabular-nums"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  )
}

export interface NavLinkProps {
  to: LinkProps["to"]
  icon?: IconName
  label: string
  /** Exact matching keeps a parent section (e.g. /admin) from lighting up on deeper screens. */
  exact?: boolean
  className?: string
}

const baseClasses =
  'flex items-center gap-2 rounded-(--radius-md) px-2 py-1.5 text-sm outline-none hover:bg-(--surface-2) data-[status=active]:bg-(--primary-soft) data-[status=active]:font-medium data-[status=active]:text-(--primary) focus-visible:ring-2 focus-visible:ring-(--focus)'

/** Navigation link from the mockup (navLink): aria-current marks the active section. */
export function NavLink({ to, icon, label, exact = false, className }: NavLinkProps) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      activeProps={{ 'aria-current': 'page' }}
      className={cn(baseClasses, className)}
    >
      {icon ? <Icon name={icon} /> : null}
      <span>{label}</span>
    </Link>
  )
}
