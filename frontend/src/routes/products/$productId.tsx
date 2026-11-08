import type { Product } from '@/lib/mock-data'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { asIconName, productSupplier, toProductData, useDeliveryMethods, useProduct } from '@/api/queries/catalogue'
import { AddToCart } from '@/components/add-to-cart'
import { Button } from '@/components/button'
import { Breadcrumb } from '@/components/breadcrumb'
import { Empty } from '@/components/empty'
import { List, ListRow } from '@/components/list'
import { ProductImage } from '@/components/product-image'
import { SectionTitle } from '@/components/section-title'
import { Stepper } from '@/components/stepper'
import { StockBadge } from '@/components/stock-badge'
import { Table } from '@/components/table'
import { WishButton } from '@/components/wish-button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { formatPrice } from '@/lib/format'
import { showToast } from '@/lib/toasts'

/** catalog-product: a product's details, with its image, specs, supplier and
    delivery methods; the cart and wish list arrive with Report II. */
export const Route = createFileRoute('/products/$productId')({
  component: ProductDetailsScreen,
})

function ProductDetailsScreen() {
  const { productId } = Route.useParams()
  const product = useProduct(productId)

  if (!product) {
    return (
      <Empty
        icon="PackageX"
        title="Product not found"
        text="It may have been removed from the catalogue."
        action={<Button label="Browse all products" variant="secondary" href="/products" />}
      />
    )
  }

  return <ProductDetails product={product} />
}

function ProductDetails({ product }: { product: Product }) {
  const view = toProductData(product)
  const supplier = productSupplier(product)
  const deliveryMethods = useDeliveryMethods().filter((method) => product.deliveryIds.includes(method.id))
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: view.categoryName ?? 'All products', href: `/products?category=${product.categoryId}` },
          { label: product.name },
        ]}
      />

      <div className="grid gap-(--sp-6) lg:grid-cols-2 lg:items-start">
        <section aria-label={product.name} className="flex flex-col">
          <ProductImage product={view} size="lg" />
        </section>

        <section aria-label="Product information" className="flex flex-col gap-(--sp-2)">
          <h1 className="text-(--fs-2xl) font-(--fw-semibold) leading-tight">{product.name}</h1>
          <Link
            to="/products"
            search={{ category: product.categoryId }}
            className="text-(--fs-sm) font-(--fw-medium) text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {view.categoryName ?? 'All products'}
          </Link>
          <div className="mt-(--sp-2) flex flex-wrap items-center gap-(--sp-3)">
            <span className="text-(--fs-2xl) font-(--fw-semibold) tabular-nums">
              {formatPrice(product.price * 100)}
            </span>
            <StockBadge product={view} />
          </div>

          <div className="flex flex-wrap items-center gap-(--sp-3)">
            <Stepper value={quantity} min={1} max={Math.max(1, product.stock)} onValueChange={setQuantity} />
            <AddToCart product={view} onClick={() => showToast('Coming in Report II')} />
            <WishButton pressed={false} onToggle={() => showToast('Coming in Report II')} />
          </div>

          <p className="max-w-prose">{product.description}</p>
        </section>
      </div>

      <div className="grid gap-(--sp-6) lg:grid-cols-2 lg:items-start">
        <section aria-label="Specifications" className="flex flex-col gap-(--sp-4)">
          <SectionTitle title="Specifications" />
          <Table
            columns={[{ label: 'Specification' }, { label: 'Value' }]}
            rows={product.specs.map(([label, value]) => [label, value])}
          />
        </section>

        <div className="flex flex-col gap-(--sp-6)">
          <section aria-label="Delivery" className="flex flex-col gap-(--sp-4)">
            <SectionTitle title="Delivery" />
            <List>
              {deliveryMethods.map((method) => (
                <ListRow
                  key={method.id}
                  lead={<Icon name={asIconName(method.icon)} className="text-primary" />}
                  title={method.name}
                  subtitle={method.time}
                  trail={
                    <span className="font-(--fw-medium) tabular-nums">
                      {method.price > 0 ? formatPrice(method.price * 100) : 'Free'}
                    </span>
                  }
                />
              ))}
            </List>
          </section>

          <section aria-label="Supplier" className="flex flex-col gap-(--sp-4)">
            <SectionTitle title="Supplier" />
            <Card>
              <p className="font-(--fw-medium)">{supplier.name}</p>
              <p className="text-sm text-(--text-muted)">{supplier.country}</p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
