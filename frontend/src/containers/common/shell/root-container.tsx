import { AppShellContainer } from '@/containers/common/shell/app-shell-container'
import { ToasterContainer } from '@/containers/common/shell/toaster-container'

export function RootContainer() {
  return (
    <>
      <AppShellContainer />
      <ToasterContainer />
    </>
  )
}
