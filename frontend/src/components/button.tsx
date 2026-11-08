import { cn } from 'cn'

import { Button as ButtonPrimitive } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { parseVariant, type MockupVariant } from '@/components/variant'

export interface ButtonProps
  extends Omit<
    React.ComponentProps<typeof ButtonPrimitive>,
    'children' | 'variant'
  > {
  /** Button label text, rendered as the children of the primitive button. */
  label: string
  /** Variant flags of the mockup, combinable: secondary | ghost | danger | block. */
  variant?: MockupVariant
  /** Render as a link styled as a button when set (mockup "button with href"). */
  href?: string
  /** Optional leading lucide icon. */
  icon?: IconName
}

/** Shared button (mockup MK.ui.button → .btn): the primitive Button with the
    mockup sizes and states, one colour variant, an optional icon and an
    optional href → link. */
export function Button({
  label,
  variant = '',
  href,
  icon,
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
    className,
  )

  const inner = (
    <>
      {icon ? <Icon name={icon} data-icon="inline-start" /> : null}
      {label}
    </>
  )

  if (href) {
    return (
      <ButtonPrimitive
        asChild
        className={classes}
        variant={tone === 'default' ? undefined : tone}
        {...props}
      >
        <a href={href} aria-disabled={props['aria-disabled'] ? 'true' : undefined}>
          {inner}
        </a>
      </ButtonPrimitive>
    )
  }

  return (
    <ButtonPrimitive
      className={classes}
      variant={tone === 'default' ? undefined : tone}
      type={type}
      {...props}
    >
      {inner}
    </ButtonPrimitive>
  )
}
