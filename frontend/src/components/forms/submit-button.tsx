import { Button, type ButtonProps } from '@/components/common/button'
import type { IconName } from '@/components/ui/icon'

export interface SubmitButtonProps
  extends Omit<ButtonProps, 'children' | 'type' | 'href'> {
  label: string
  icon?: IconName
}

export function SubmitButton({ label, icon, ...props }: SubmitButtonProps) {
  return <Button type="submit" label={label} icon={icon} {...props} />
}
