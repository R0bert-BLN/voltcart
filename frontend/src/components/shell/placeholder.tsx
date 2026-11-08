import { useRouter } from '@tanstack/react-router'

import { Empty } from '@/components/empty'
import { PageHead } from '@/components/page-head'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'

export interface PlaceholderScreenProps {
  /** Screen title; also the page's h1. */
  title: string
  /** One line on what the screen will do once its ticket is built. */
  text?: string
}

/** Placeholder for a screen whose ticket is not built yet: title, note and a
    way back (acceptance criterion: back navigation works on every screen). */
export function PlaceholderScreen({ title, text }: PlaceholderScreenProps) {
  const router = useRouter()

  return (
    <div data-slot="placeholder-screen" className="flex flex-col gap-6">
      <PageHead title={title} />
      <Empty
        icon="Hammer"
        title="Coming in a later ticket"
        text={text ?? 'This screen is part of a later ticket on the board.'}
        action={
          <Button variant="outline" onClick={() => router.history.back()}>
            <Icon name="ArrowLeft" data-icon="inline-start" />
            Go back
          </Button>
        }
      />
    </div>
  )
}
