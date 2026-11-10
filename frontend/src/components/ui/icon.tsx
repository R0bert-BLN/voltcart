import { icons } from 'lucide-react'

import { type IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'

export type { IconName }

export interface IconProps extends React.ComponentProps<'svg'> {
  name: IconName
}

export function Icon({ name, className, ...props }: IconProps) {
  const Lucide = icons[name]

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
