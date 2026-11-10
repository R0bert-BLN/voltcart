import { PageHead } from '@/components/common/page-head'

export interface CheckoutFrameProps {
  children: React.ReactNode
}

export function CheckoutFrame({ children }: CheckoutFrameProps) {
  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead title="Checkout" />
      {children}
    </div>
  )
}
