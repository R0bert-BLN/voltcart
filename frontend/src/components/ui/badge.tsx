import { cn } from 'cn'

import { Icon, type IconName } from '@/components/ui/icon'

export type BadgeTone = '' | 'success' | 'warning' | 'danger'

export interface BadgeProps extends React.ComponentProps<'span'> {
  /** Status tone; omit for the neutral badge. */
  tone?: BadgeTone
  /** Optional leading lucide icon. */
  icon?: IconName
}

const toneClasses = {
  '': 'bg-(--surface-2) text-(--text-muted)',
  success: 'bg-(--success-soft) text-(--success)',
  warning: 'bg-(--warning-soft) text-(--warning)',
  danger: 'bg-(--danger-soft) text-(--danger)',
} as const satisfies Record<BadgeTone, string>

/** Status label from the mockup: pill, Extra Small type, tone from --*-soft/--* tokens. */
export function Badge({ tone = '', icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      className={cn(
        'badge inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[2px] text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {icon ? <Icon name={icon} className="size-(--fs-sm)" /> : null}
      {children}
    </span>
  )
}
