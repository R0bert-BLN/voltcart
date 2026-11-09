import { createFileRoute } from '@tanstack/react-router'

import { asIconName, useAdminOverview } from '@/api/queries/catalogue'
import { useAdminName } from '@/api/queries/auth'
import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { List, ListRow } from '@/components/common/list'
import { PageHead } from '@/components/common/page-head'
import { ProductImage } from '@/components/catalogue/product-image'
import { SectionTitle } from '@/components/common/section-title'
import { Stat } from '@/components/admin/stat'

/** The plural of count, as the mockup's plural(). */
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** admin-dashboard: the admin overview.
    Sign-in lands here, the four count tiles lead into the area and the
    Needs attention list opens every low product straight on its Stock field
    (decisions 2026-11-02: no separate stock screen). */
export const Route = createFileRoute('/admin/')({
  component: AdminDashboardScreen,
})

function AdminDashboardScreen() {
  const { productsCount, categoriesCount, lowStock, outOfStockCount } = useAdminOverview()
  const adminName = useAdminName()

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead
        title="Overview"
        subtitle={`Signed in as ${adminName}.`}
        actions={
          <Button label="Add product" icon={asIconName('plus')} href="/admin/products/new" />
        }
      />
      <div data-slot="stat-grid" className="grid gap-(--sp-4) sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Products"
          value={productsCount}
          icon={asIconName('package')}
          href="/admin/products"
        />
        <Stat
          label="Categories"
          value={categoriesCount}
          icon={asIconName('layout-grid')}
        />
        <Stat
          label="Low stock"
          value={lowStock.length}
          icon={asIconName('triangle-alert')}
          tone="warning"
          href="/admin/products?stock=low"
        />
        <Stat
          label="Out of stock"
          value={outOfStockCount}
          icon={asIconName('circle-x')}
          tone="danger"
          href="/admin/products?stock=out"
        />
      </div>
      <section className="flex flex-col gap-(--sp-4)">
        <SectionTitle title="Needs attention" />
        {lowStock.length > 0 ? (
          <List>
            {lowStock.map(({ product, supplierName }) => (
              <ListRow
                key={product.id}
                title={product.name}
                subtitle={`${plural(product.stock, 'unit')} left · ${supplierName}`}
                lead={<ProductImage product={product} size="sm" />}
                trail={
                  <Button
                    label="Update stock"
                    variant="ghost"
                    href={`/admin/products/${product.id}/edit?focus=stock`}
                    aria-label={`Update stock of ${product.name}`}
                    className="px-(--sp-3) text-(--fs-sm) min-h-(--control-sm)"
                  />
                }
              />
            ))}
          </List>
        ) : (
          <Empty
            icon={asIconName('circle-check')}
            title="Nothing needs attention"
            text="No product is low on stock."
          />
        )}
      </section>
    </div>
  )
}
