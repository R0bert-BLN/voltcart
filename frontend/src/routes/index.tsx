import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { PingData } from '@/api/generated/types'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const ping = useQuery({
    queryKey: ['ping'],
    queryFn: async (): Promise<PingData> => (await fetch('/api/ping')).json(),
  })
  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold">Voltcart</h1>
      <p>API: {ping.isPending ? 'checking…' : ping.data?.ok ? 'connected' : 'not reachable'}</p>
    </main>
  )
}
