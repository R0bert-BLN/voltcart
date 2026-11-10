import { Toaster } from '@/components/common/toaster'
import { dismissToast, useToasts } from '@/lib/toasts'

export function ToasterContainer() {
  const toasts = useToasts()

  return <Toaster toasts={toasts} onDismiss={dismissToast} />
}
