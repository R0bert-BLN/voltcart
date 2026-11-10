import { Link } from '@tanstack/react-router'

import type { ProductData } from '@/api/generated/types'
import type { CategoryOption, DeliveryOption } from '@/api/queries/common/catalogue'
import { Carousel } from '@/components/client/carousel'
import { ProductGrid } from '@/components/client/product-grid'
import { SectionTitle } from '@/components/common/section-title'
import { Icon } from '@/components/ui/icon'
import { formatDeliveryPrice, plural } from '@/lib/format'

export interface StoreHomeViewProps {
  categories: CategoryOption[]
  popular: ProductData[]
  deliveryMethods: DeliveryOption[]
  wishedIds: readonly string[]
  onAdd: (product: ProductData) => void
  onWish: (product: ProductData) => void
}

const CATEGORY_TILE_CLASS =
  'flex h-full flex-col items-center gap-(--sp-1) rounded-(--radius-lg) border border-border bg-surface px-(--sp-2) py-(--sp-5) text-center font-(--fw-medium) outline-none transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50'

const TEXT_LINK_CLASS =
  'text-(--fs-sm) text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'

function ServiceItem({ icon, title, detail }: { icon: DeliveryOption['icon']; title: string; detail: string }) {
  return (
    <li className="flex items-center gap-(--sp-3) font-(--fw-medium)">
      <Icon name={icon} className="text-primary" />
      <span>
        {title}
        <small className="block text-(--fs-sm) font-(--fw-regular) text-(--text-muted)">
          {detail}
        </small>
      </span>
    </li>
  )
}

export function StoreHomeView({
  categories,
  popular,
  deliveryMethods,
  wishedIds,
  onAdd,
  onWish,
}: StoreHomeViewProps) {
  return (
    <div className="flex flex-col gap-(--sp-8)">
      <h1 className="sr-only">Voltcart electronics store</h1>
      <section className="flex flex-col gap-(--sp-4)">
        <SectionTitle title="Shop by category" />
        <Carousel label="categories">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/products"
              search={{ category: category.id }}
              className={CATEGORY_TILE_CLASS}
            >
              <Icon name={category.icon} className="mb-(--sp-2) size-7 text-primary" />
              {category.name}
              <small className="text-(--fs-sm) font-(--fw-regular) text-(--text-muted)">
                {plural(category.productsCount, 'product')}
              </small>
            </Link>
          ))}
        </Carousel>
      </section>
      {popular.length > 0 ? (
        <section className="flex flex-col gap-(--sp-4)">
          <SectionTitle
            title="Popular products"
            action={
              <Link to="/products" className={TEXT_LINK_CLASS}>
                All products
              </Link>
            }
          />
          <ProductGrid products={popular} wishedIds={wishedIds} onAdd={onAdd} onWish={onWish} />
        </section>
      ) : null}
      <ul
        aria-label="Delivery and returns"
        className="grid gap-(--sp-4) rounded-(--radius-lg) border border-border bg-surface p-(--sp-5) sm:grid-cols-2 sm:px-(--sp-6) lg:grid-cols-4"
      >
        {deliveryMethods.map((method) => (
          <ServiceItem
            key={method.id}
            icon={method.icon}
            title={method.name}
            detail={`${formatDeliveryPrice(method.priceCents)}, ${method.time.toLowerCase()}`}
          />
        ))}
        <ServiceItem icon="RotateCcw" title="30-day returns" detail="On unused items" />
      </ul>
    </div>
  )
}
