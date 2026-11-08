import { cn } from 'cn'

import { Icon } from '@/components/ui/icon'

export interface BreadcrumbItem {
  label: string
  /** Omit for the current page; intermediate items without a href render as plain text. */
  href?: string
}

export interface BreadcrumbProps extends React.ComponentProps<'nav'> {
  items: BreadcrumbItem[]
}

/** Trail from the mockup (MK.ui.breadcrumb → .breadcrumb): the last item is the
    current page and never links; earlier ones link when they carry a href. */
export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="breadcrumb"
      className={cn('flex flex-wrap items-center gap-1 text-sm text-muted-foreground', className)}
      {...props}
    >
      <ol className="contents">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          return (
            <li key={item.href ?? `${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isCurrent ? (
                <a href={item.href} className="hover:text-primary">
                  {item.label}
                </a>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined}>{item.label}</span>
              )}
              {isCurrent ? null : <Icon name="ChevronRight" className="size-(--fs-sm)" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
