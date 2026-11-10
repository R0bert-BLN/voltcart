import { redirect } from '@tanstack/react-router'

import { isSignedIn } from '@/api/client'

export function requireSignedIn(next: string): void {
  if (!isSignedIn()) {
    throw redirect({ to: '/login', search: { next } })
  }
}
