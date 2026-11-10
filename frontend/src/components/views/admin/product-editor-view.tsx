import type { CategoryOption, DeliveryOption } from '@/api/queries/common/catalogue'
import { Button } from '@/components/common/button'
import { DeleteProductSheet } from '@/components/admin/delete-product-sheet'
import { PageHead } from '@/components/common/page-head'
import { ProductForm } from '@/components/admin/product-form'
import { SubmitButton } from '@/components/forms/submit-button'
import type { Supplier } from '@/lib/mock-data'
import type { ProductFormErrors, ProductFormValues } from '@/lib/admin/product-form'

export interface ProductEditorDelete {
  productName: string
  open: boolean
  onRequest: () => void
  onCancel: () => void
  onConfirm: () => void
}

export interface ProductEditorViewProps {
  title: string
  subtitle?: string
  submitLabel: string
  product?: ProductFormValues
  suppliers: Supplier[]
  categories: CategoryOption[]
  deliveryMethods: DeliveryOption[]
  errors: ProductFormErrors
  deliveryError: string | undefined
  deletion?: ProductEditorDelete
  onChange: (event: React.FormEvent<HTMLFormElement>) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function ProductEditorView({
  title,
  subtitle,
  submitLabel,
  product,
  suppliers,
  categories,
  deliveryMethods,
  errors,
  deliveryError,
  deletion,
  onChange,
  onSubmit,
}: ProductEditorViewProps) {
  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead title={title} subtitle={subtitle} />
      <ProductForm
        noValidate
        product={product}
        suppliers={suppliers}
        categories={categories}
        deliveryMethods={deliveryMethods}
        errors={errors}
        deliveryError={deliveryError}
        onChange={onChange}
        onSubmit={onSubmit}
        actions={
          <>
            <SubmitButton label={submitLabel} variant="block" />
            <Button label="Cancel" variant="ghost block" href="/admin/products" />
            {deletion ? (
              <Button
                label="Delete product"
                variant="ghost block"
                className="text-danger"
                onClick={deletion.onRequest}
              />
            ) : null}
          </>
        }
      />
      {deletion ? (
        <DeleteProductSheet
          productName={deletion.productName}
          open={deletion.open}
          onCancel={deletion.onCancel}
          onConfirm={deletion.onConfirm}
        />
      ) : null}
    </div>
  )
}
