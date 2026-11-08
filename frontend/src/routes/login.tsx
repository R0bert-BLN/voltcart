import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** auth-login: sign in. */
export const Route = createFileRoute('/login')({
  component: () => (
    <PlaceholderScreen
      title="Sign in"
      text="The sign-in form arrives with the auth tickets."
    />
  ),
})
