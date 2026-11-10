import { createFileRoute } from '@tanstack/react-router'

import { RegisterContainer } from '@/containers/common/auth/register-container'
import { parseNextSearch } from '@/lib/search-params'

export const Route = createFileRoute('/register')({
  validateSearch: parseNextSearch,
  component: RegisterContainer,
})
