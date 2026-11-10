import { Button as ButtonPrimitive } from '@/components/ui/button'
import { AppLink } from '@/components/common/app-link'
import { parseVariant, type ButtonVariant } from '@/components/common/button-variant'
import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends Omit<React.ComponentProps<typeof ButtonPrimitive>, 'children' | 'variant'> {
  label: string
  variant?: ButtonVariant
  href?: string
  icon?: IconName
  compact?: boolean
}

export function Button({
  label,
  variant = '',
  href,
  icon,
  compact = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const { primitive: tone, block } = parseVariant(variant)
  const classes = cn(
    'min-h-(--control) gap-2 px-4 pointer-coarse:min-h-11',
    'disabled:bg-secondary disabled:text-muted-foreground disabled:border-border disabled:cursor-not-allowed',
    'aria-disabled:pointer-events-none aria-disabled:bg-secondary aria-disabled:text-muted-foreground aria-disabled:border-border',
    block && 'w-full',
    compact && 'min-h-(--control-sm) px-(--sp-3) text-(--fs-sm)',
    className,
  )
  const primitiveVariant = tone === 'default' ? undefined : tone

  const content = (
    <>
      {icon ? <Icon name={icon} data-icon="inline-start" /> : null}
      {label}
    </>
  )

  if (href) {
    return (
      <ButtonPrimitive asChild className={classes} variant={primitiveVariant} {...props}>
        <AppLink href={href} aria-disabled={props['aria-disabled'] ? 'true' : undefined}>
          {content}
        </AppLink>
      </ButtonPrimitive>
    )
  }

  return (
    <ButtonPrimitive className={classes} variant={primitiveVariant} type={type} {...props}>
      {content}
    </ButtonPrimitive>
  )
}
