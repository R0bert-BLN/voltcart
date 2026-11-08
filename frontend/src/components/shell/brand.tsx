import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'

import { cn } from 'cn'
import { Icon } from '@/components/ui/icon'

export interface BrandProps {
  /** Where the mark leads: the store home, or the admin dashboard on admin screens. */
  to: LinkProps['to']
  className?: string
}

/** App mark from the mockup (.brand): the zap tile and the store name as one link. */
export function Brand({ to, className }: BrandProps) {
  return (
    <Link
      to={to}
      data-slot="brand"
      className={cn('flex items-center gap-2 text-lg font-semibold', className)}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-(--radius-md) bg-primary text-(--text-on-primary)">
        <Icon name="Zap" />
      </span>
      <span>Voltcart</span>
    </Link>
  )
}
