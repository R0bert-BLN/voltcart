import { createFileRoute, Link } from '@tanstack/react-router'

import { useCategories, useDeliveryMethods, usePopularProducts, asIconName } from '@/api/queries/catalogue'
import { Carousel } from '@/components/catalogue/carousel'
import { ProductGrid } from '@/components/catalogue/product-grid'
import { SectionTitle } from '@/components/common/section-title'
import { Icon } from '@/components/ui/icon'
import { formatPrice } from '@/lib/format'
import { showToast } from '@/lib/toasts'

/** The cart and wish list arrive with modules 4 and 5 (Report II); their
    buttons stay visible but acknowledge the action for now (Design notes). */
const comingInReportII = () => showToast('Coming in Report II')

/** The plural of count for the category tiles, as the mockup's plural(). */
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** catalog-home: the store home. */
export const Route = createFileRoute('/')({
  component: StoreHomeScreen,
})

function StoreHomeScreen() {
  const categories = useCategories()
  const popular = usePopularProducts(8)
  const deliveryMethods = useDeliveryMethods()

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
              className="flex h-full flex-col items-center gap-(--sp-1) rounded-(--radius-lg) border border-border bg-surface px-(--sp-2) py-(--sp-5) text-center font-(--fw-medium) outline-none transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Icon name={asIconName(category.icon)} className="mb-(--sp-2) size-7 text-primary" />
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
              <Link
                to="/products"
                className="text-(--fs-sm) text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                All products
              </Link>
            }
          />
          <ProductGrid products={popular} onAdd={comingInReportII} onWish={comingInReportII} />
        </section>
      ) : null}
      <ul
        aria-label="Delivery and returns"
        className="grid gap-(--sp-4) rounded-(--radius-lg) border border-border bg-surface p-(--sp-5) sm:grid-cols-2 lg:grid-cols-4 sm:p-(--sp-5) sm:px-(--sp-6)"
      >
        {deliveryMethods.map((method) => (
          <li key={method.id} className="flex items-center gap-(--sp-3) font-(--fw-medium)">
            <Icon name={asIconName(method.icon)} className="text-primary" />
            <span>
              {method.name}
              <small className="block text-(--fs-sm) font-(--fw-regular) text-(--text-muted)">
                {method.price > 0 ? `${formatPrice(method.price * 100)}, ` : 'Free, '}
                {method.time.toLowerCase()}
              </small>
            </span>
          </li>
        ))}
        <li className="flex items-center gap-(--sp-3) font-(--fw-medium)">
          <Icon name={asIconName('rotate-ccw')} className="text-primary" />
          <span>
            30-day returns
            <small className="block text-(--fs-sm) font-(--fw-regular) text-(--text-muted)">
              On unused items
            </small>
          </span>
        </li>
      </ul>
    </div>
  )
}
