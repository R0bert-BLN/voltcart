import { Link } from '@tanstack/react-router'

import type { ProductDetails } from '@/api/queries/common/catalogue'
import { AddToCart } from '@/components/client/add-to-cart'
import { List, ListRow } from '@/components/common/list'
import { ProductImage } from '@/components/common/product-image'
import { SectionTitle } from '@/components/common/section-title'
import { Stepper } from '@/components/client/stepper'
import { StockBadge } from '@/components/common/stock-badge'
import { Table } from '@/components/common/table'
import { WishButton } from '@/components/client/wish-button'
import { Icon } from '@/components/ui/icon'
import { formatDeliveryPrice, formatPrice } from '@/lib/format'

export interface ProductDetailsViewProps {
  details: ProductDetails
  quantity: number
  onQuantityChange: (quantity: number) => void
  wished: boolean
  onAdd: () => void
  onWish: () => void
}

export function ProductDetailsView({
  details,
  quantity,
  onQuantityChange,
  wished,
  onAdd,
  onWish,
}: ProductDetailsViewProps) {
  const { product, supplier, deliveryMethods } = details
  const categoryName = product.categoryName ?? 'All products'

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <div className="grid gap-(--sp-6) lg:grid-cols-2 lg:items-start">
        <section aria-label={product.name} className="flex flex-col">
          <ProductImage product={product} size="lg" />
        </section>

        <section aria-label="Product information" className="flex flex-col gap-(--sp-2)">
          <h1 className="text-(--fs-2xl) font-(--fw-semibold) leading-tight">{product.name}</h1>
          <Link
            to="/products"
            search={{ category: product.categoryId ?? undefined }}
            className="text-(--fs-sm) font-(--fw-medium) text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {categoryName}
          </Link>
          <div className="mt-(--sp-2) flex flex-wrap items-center gap-(--sp-3)">
            <span className="text-(--fs-2xl) font-(--fw-semibold) tabular-nums">
              {formatPrice(product.priceCents)}
            </span>
            <StockBadge product={product} />
          </div>

          <div className="flex flex-wrap items-center gap-(--sp-3)">
            <Stepper
              value={quantity}
              min={1}
              max={Math.max(1, product.stock)}
              onValueChange={onQuantityChange}
            />
            <AddToCart product={product} onClick={onAdd} />
            <WishButton pressed={wished} onToggle={onWish} />
          </div>

          <p className="max-w-prose">{product.description}</p>
          <p className="flex max-w-prose items-start gap-(--sp-2) text-(--fs-sm) text-(--text-muted)">
            <Icon name="Store" aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
            <span>
              Supplied by <strong className="font-(--fw-medium) text-text">{supplier.name}</strong>,
              based in {supplier.country}.
            </span>
          </p>
        </section>
      </div>

      <div className="grid gap-(--sp-6) lg:grid-cols-2 lg:items-start">
        <section aria-label="Specifications" className="flex flex-col gap-(--sp-4)">
          <SectionTitle title="Specifications" />
          <Table
            columns={[{ label: 'Specification' }, { label: 'Value' }]}
            rows={product.specs.map(({ label, value }) => [label, value])}
          />
        </section>

        <div className="flex flex-col gap-(--sp-6)">
          <section aria-label="Delivery" className="flex flex-col gap-(--sp-4)">
            <SectionTitle title="Delivery" />
            <List>
              {deliveryMethods.map((method) => (
                <ListRow
                  key={method.id}
                  lead={<Icon name={method.icon} className="text-primary" />}
                  title={method.name}
                  subtitle={method.time}
                  trail={
                    <span className="font-(--fw-medium) tabular-nums">
                      {formatDeliveryPrice(method.priceCents)}
                    </span>
                  }
                />
              ))}
            </List>
          </section>
        </div>
      </div>
    </div>
  )
}
