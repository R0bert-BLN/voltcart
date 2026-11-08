import { icons } from 'lucide-react'

import { cn } from 'cn'

export type IconName = keyof typeof icons

export interface IconProps extends React.ComponentProps<'svg'> {
  /** Kebab-case lucide name, e.g. "shopping-cart". */
  name: IconName
}

/** Lucide icon; hidden from the accessibility tree, sized by the context (see theme.css). */
export function Icon({ name, className, ...props }: IconProps) {
  // Kebab-case name → PascalCase export; unknown names fall back to the alert
  // circle so a typo in data cannot take the layout down.
  const Lucide = icons[toPascalCase(name) as IconName] ?? icons.CircleQuestionMark

  return (
    <Lucide
      aria-hidden="true"
      data-slot="icon"
      data-icon={name}
      className={cn('size-(--icon) shrink-0', className)}
      {...props}
    />
  )
}

const toPascalCase = (name: string): string =>
  name.replace(/(^|[-_])(\w)/g, (_, _sep: string, character: string) => character.toUpperCase())
