import { createFileRoute } from '@tanstack/react-router'

import { PlaceholderScreen } from '@/components/shell/placeholder'

/** auth-register: create account. */
export const Route = createFileRoute('/register')({
  component: () => (
    <PlaceholderScreen
      title="Create account"
      text="The registration form arrives with the auth tickets."
    />
  ),
})
