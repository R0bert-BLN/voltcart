import { Empty } from '@/components/common/empty'

export interface LoadingStateProps {
  title: string
  text: string
}

export function LoadingState({ title, text }: LoadingStateProps) {
  return <Empty icon="Clock" title={title} text={text} />
}
