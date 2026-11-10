import { useId, useState } from 'react'

import { Button } from '@/components/common/button'
import { Field } from '@/components/forms/field'
import { FilterCheck } from '@/components/forms/filter-check'
import { FilterGroup } from '@/components/forms/filter-group'
import { Select } from '@/components/forms/select'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { formatDeliveryPrice } from '@/lib/format'
import type { ProductFormErrors, ProductFormValues } from '@/lib/admin/product-form'
import { cn } from '@/lib/utils'

interface NamedOption {
  id: string
  name: string
}

interface DeliveryChoice extends NamedOption {
  priceCents: number
  time: string
}

export interface ProductFormProps extends React.ComponentProps<'form'> {
  product?: Partial<ProductFormValues>
  suppliers: NamedOption[]
  categories: NamedOption[]
  deliveryMethods: DeliveryChoice[]
  deliveryError?: string | undefined
  errors?: ProductFormErrors
  actions?: React.ReactNode
}

interface SpecRow {
  key: string
  label?: string
  value?: string
}

const CONTROL_CLASS =
  'min-h-(--control) w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const toOption = ({ id, name }: NamedOption) => ({ value: id, label: name })

const deliveryLabel = (method: DeliveryChoice): string =>
  `${method.name}: ${formatDeliveryPrice(method.priceCents).toLowerCase()}, ${method.time.toLowerCase()}`

const newSpecRow = (spec: Partial<SpecRow> = {}): SpecRow => ({ ...spec, key: crypto.randomUUID() })

function CardHead({ children }: { children: React.ReactNode }) {
  return <h2 className="text-(--fs-xl) font-(--fw-semibold) leading-(--lh-tight)">{children}</h2>
}

export function ProductForm({
  product = {},
  suppliers,
  categories,
  deliveryMethods,
  deliveryError,
  errors,
  actions,
  className,
  ...props
}: ProductFormProps) {
  const autoId = useId()
  const descriptionId = `desc-${autoId}`
  const specsId = `specs-${autoId}`

  const [specs, setSpecs] = useState<SpecRow[]>(() =>
    (product.specs?.length ? product.specs : [{}]).map(newSpecRow),
  )
  const addSpec = () => setSpecs((rows) => [...rows, newSpecRow()])
  const removeSpec = (key: string) => setSpecs((rows) => rows.filter((row) => row.key !== key))

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
        <Card className="gap-4">
          <CardHead>Product details</CardHead>
          <Field
            label="Name"
            name="name"
            required
            maxLength={80}
            defaultValue={product.name}
            error={errors?.name}
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
              className={cn(CONTROL_CLASS, 'resize-y py-2')}
            />
          </div>
        </Card>

        <Card className="gap-4">
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
                  className={CONTROL_CLASS}
                />
                <input
                  aria-label="Specification value"
                  placeholder="Value, e.g. 1.2 kg"
                  maxLength={100}
                  defaultValue={row.value}
                  className={CONTROL_CLASS}
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

        <Card className="gap-4">
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
              defaultValue={product.price}
              error={errors?.price}
            />
            <Field
              label="Stock"
              name="stock"
              type="number"
              required
              min="0"
              max="99999"
              step="1"
              defaultValue={product.stock}
              error={errors?.stock}
            />
          </div>
        </Card>

        <Card className="gap-4">
          <CardHead>Supply and delivery</CardHead>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Supplier"
              name="supplierId"
              required
              placeholder="Choose a supplier"
              defaultValue={product.supplierId ?? ''}
              options={suppliers.map(toOption)}
              error={errors?.supplierId}
            />
            <Select
              label="Category"
              name="categoryId"
              required
              placeholder="Choose a category"
              defaultValue={product.categoryId ?? ''}
              options={categories.map(toOption)}
              error={errors?.categoryId}
            />
          </div>
          <FilterGroup title="Delivery methods">
            {deliveryMethods.map((method) => (
              <FilterCheck
                key={method.id}
                name="deliveryIds"
                value={method.id}
                label={deliveryLabel(method)}
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

      <aside className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">{actions}</div>
      </aside>
    </form>
  )
}
