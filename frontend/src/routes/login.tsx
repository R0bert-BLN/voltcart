import { createFileRoute } from '@tanstack/react-router'

import { LoginContainer } from '@/containers/common/auth/login-container'
import { parseNextSearch } from '@/lib/search-params'

export const Route = createFileRoute('/login')({
  validateSearch: parseNextSearch,
  component: LoginContainer,
})
