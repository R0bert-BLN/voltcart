import { cn } from 'cn'

export interface FilterGroupProps extends React.ComponentProps<'fieldset'> {
  /** Legend text naming the items, e.g. "Delivery methods". */
  title: string
}

/** Fieldset of a filter or checkbox group from the mockup (MK.ui.filterGroup →
    .filter-group): a borderless fieldset whose legend labels the check rows. */
export function FilterGroup({ title, className, children, ...props }: FilterGroupProps) {
  return (
    <fieldset
      data-slot="filter-group"
      className={cn('m-0 flex min-w-0 flex-col gap-1 border-0 p-0 text-sm', className)}
      {...props}
    >
      <legend className="mb-2 p-0 font-medium">{title}</legend>
      {children}
    </fieldset>
  )
}
