import { Button, type ButtonProps } from '@/components/button'
import type { IconName } from '@/components/ui/icon'

export interface SubmitButtonProps
  extends Omit<ButtonProps, 'children' | 'type' | 'href'> {
  /** Button label text. */
  label: string
  /** Optional leading lucide icon. */
  icon?: IconName
}

/** The submit button of a form (mockup MK.ui.submit → .btn): the shared
    Button with type="submit". */
export function SubmitButton({ label, icon, ...props }: SubmitButtonProps) {
  return <Button type="submit" label={label} icon={icon} {...props} />
}
