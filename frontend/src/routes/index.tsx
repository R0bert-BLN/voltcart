import { createFileRoute } from '@tanstack/react-router'

import { StoreHomeContainer } from '@/containers/client/catalogue/store-home-container'

export const Route = createFileRoute('/')({
  component: StoreHomeContainer,
})
