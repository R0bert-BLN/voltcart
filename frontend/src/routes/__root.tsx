import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext } from '@tanstack/react-router'

import { AppShell } from '@/components/shell/app-shell'
import { Toaster } from '@/components/toaster'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // The toaster sits outside the router outlet, so a toast survives the
  // navigation that triggered it.
  component: () => (
    <>
      <AppShell />
      <Toaster />
    </>
  ),
})
