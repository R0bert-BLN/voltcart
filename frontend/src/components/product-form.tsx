import { useId, useState } from 'react'

import { cn } from 'cn'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { FilterCheck } from '@/components/filter-check'
import { FilterGroup } from '@/components/filter-group'
import { Icon } from '@/components/ui/icon'
import { Select } from '@/components/select'
import { Card } from '@/components/ui/card'

export interface ProductFormOption {
  value: string
  label: string
}

/** Delivery row shown as a compact check; the caller formats the label from
    the delivery method data (mockup app.js does it with MK.money). */
export interface ProductFormDelivery {
  id: string
  label: React.ReactNode
}

/** Values to prefill; omit the ones that draw from suppliers, categories and
    delivery methods, they come as separate props. */
export interface ProductFormProduct {
  name?: string
  description?: string
  priceCents?: number | null
  stock?: number | null
  supplierId?: string
  categoryId?: string
  deliveryIds?: string[]
  specs?: Array<{ label?: string; value?: string }>
}

export interface ProductFormProps extends React.ComponentProps<'form'> {
  product?: ProductFormProduct
  suppliers: ProductFormOption[]
  categories: ProductFormOption[]
  deliveryMethods: ProductFormDelivery[]
  /** Validation message shown at the foot of the delivery group. */
  deliveryError?: string
  /** Buttons and links for the sticky aside beside the form. */
  actions?: React.ReactNode
  className?: string
}

const control =
  'min-h-(--control) w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const CardHead = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-(--fs-xl) font-(--fw-semibold) leading-(--lh-tight)">{children}</h2>
)

/** Add and edit product form from the mockup (MK.ui.productForm →
    .form-layout): the details, specifications, price and stock and supply
    cards in the main column, the actions in the sticky aside. Uncontrolled:
    prefill comes from `product`, submit and its validation from the caller. */
export function ProductForm({
  product = {},
  suppliers,
  categories,
  deliveryMethods,
  deliveryError,
  actions,
  className,
  ...props
}: ProductFormProps) {
  const autoId = useId()
  const descriptionId = `desc-${autoId}`
  const specsId = `specs-${autoId}`

  const [specs, setSpecs] = useState<Array<{ key: string; label?: string; value?: string }>>(() =>
    (product.specs?.length ? product.specs : [{}]).map((spec) => ({
      ...spec,
      key: crypto.randomUUID(),
    })),
  )
  const addSpec = () => setSpecs((rows) => [...rows, { key: crypto.randomUUID() }])
  const removeSpec = (key: string) => setSpecs((rows) => rows.filter((row) => row.key !== key))

  const cardClass = 'gap-4'

  return (
    <form
      data-slot="product-form"
      className={cn(
        'grid max-w-(--form-max) grid-cols-1 items-start gap-5',
        'lg:grid-cols-[minmax(0,1fr)_var(--aside-w)]',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Card className={cardClass}>
          <CardHead>Product details</CardHead>
          <Field
            label="Name"
            name="name"
            required
            maxLength={80}
            defaultValue={product.name}
          />
          <div data-slot="field" className="flex flex-col gap-1 text-sm">
            <label className="font-medium" htmlFor={descriptionId}>
              Description
            </label>
            <textarea
              id={descriptionId}
              name="description"
              rows={3}
              maxLength={600}
              defaultValue={product.description}
              className={cn(control, 'resize-y py-2')}
            />
          </div>
        </Card>

        <Card className={cardClass}>
          <CardHead>Specifications</CardHead>
          <p className="text-sm text-text-muted">
            Rows with a missing label or value are not saved.
          </p>
          <div id={specsId} className="flex min-w-0 flex-col gap-2" aria-label="Specification rows">
            {specs.map((row) => (
              <div
                key={row.key}
                data-slot="spec-row"
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_var(--control)] items-center gap-2"
              >
                <input
                  aria-label="Specification label"
                  placeholder="Label, e.g. Weight"
                  maxLength={40}
                  defaultValue={row.label}
                  className={control}
                />
                <input
                  aria-label="Specification value"
                  placeholder="Value, e.g. 1.2 kg"
                  maxLength={100}
                  defaultValue={row.value}
                  className={control}
                />
                <button
                  type="button"
                  aria-label="Remove this specification"
                  onClick={() => removeSpec(row.key)}
                  className="grid size-(--control) cursor-pointer place-items-center rounded-[var(--radius-md)] bg-transparent text-text transition-colors outline-none hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Icon name="X" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <div>
            <Button label="Add specification" variant="ghost" icon="Plus" onClick={addSpec} />
          </div>
        </Card>

        <Card className={cardClass}>
          <CardHead>Price and stock</CardHead>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Price (€)"
              name="price"
              type="number"
              required
              min="0.01"
              max="99999"
              step="0.01"
              inputMode="decimal"
              defaultValue={product.priceCents == null ? undefined : product.priceCents / 100}
            />
            <Field
              label="Stock"
              name="stock"
              type="number"
              required
              min="0"
              max="99999"
              step="1"
              defaultValue={product.stock == null ? undefined : product.stock}
            />
          </div>
        </Card>

        <Card className={cardClass}>
          <CardHead>Supply and delivery</CardHead>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Supplier"
              name="supplierId"
              required
              placeholder="Choose a supplier"
              defaultValue={product.supplierId}
              options={suppliers}
            />
            <Select
              label="Category"
              name="categoryId"
              required
              placeholder="Choose a category"
              defaultValue={product.categoryId}
              options={categories}
            />
          </div>
          <FilterGroup title="Delivery methods">
            {deliveryMethods.map((method) => (
              <FilterCheck
                key={method.id}
                name="deliveryIds"
                value={method.id}
                label={method.label}
                defaultChecked={(product.deliveryIds ?? []).includes(method.id)}
              />
            ))}
            {deliveryError ? (
              <p role="alert" className="flex items-center gap-1 text-sm text-danger">
                <Icon name="CircleExclamationPoint" className="size-(--fs-sm)" />
                {deliveryError}
              </p>
            ) : null}
          </FilterGroup>
        </Card>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
        <div className="flex flex-col gap-2">{actions}</div>
      </aside>
    </form>
  )
}
