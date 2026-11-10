import { Button } from '@/components/common/button'
import { Sheet } from '@/components/admin/sheet'

export interface DeleteProductSheetProps {
  productName: string | undefined
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteProductSheet({ productName, open, onCancel, onConfirm }: DeleteProductSheetProps) {
  return (
    <Sheet title="Delete product" open={open} onOpenChange={(next) => !next && onCancel()}>
      <p>
        Delete <strong>{productName}</strong>? It is removed from the catalogue, the cart and the
        wish list.
      </p>
      <div className="flex justify-end gap-(--sp-2)">
        <Button label="Cancel" variant="ghost" onClick={onCancel} />
        <Button label="Delete product" variant="danger" onClick={onConfirm} />
      </div>
    </Sheet>
  )
}
