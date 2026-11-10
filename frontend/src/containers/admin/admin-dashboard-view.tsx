import type { AdminOverview } from '@/api/queries/admin/catalogue'
import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { List, ListRow } from '@/components/common/list'
import { PageHead } from '@/components/common/page-head'
import { ProductImage } from '@/components/common/product-image'
import { SectionTitle } from '@/components/common/section-title'
import { Stat } from '@/components/admin/stat'
import { plural } from '@/lib/format'

export interface AdminDashboardViewProps {
  overview: AdminOverview
  adminName: string
}

export function AdminDashboardView({ overview, adminName }: AdminDashboardViewProps) {
  const { productsCount, categoriesCount, lowStock, outOfStockCount } = overview

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead
        title="Overview"
        subtitle={`Signed in as ${adminName}.`}
        actions={<Button label="Add product" icon="Plus" href="/admin/products/new" />}
      />
      <div data-slot="stat-grid" className="grid gap-(--sp-4) sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Products" value={productsCount} icon="Package" />
        <Stat label="Categories" value={categoriesCount} icon="LayoutGrid" />
        <Stat
          label="Low stock"
          value={lowStock.length}
          icon="TriangleExclamationPoint"
          tone="warning"
        />
        <Stat
          label="Out of stock"
          value={outOfStockCount}
          icon="CircleX"
          tone="danger"
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
                    compact
                    href={`/admin/products/${product.id}/edit?focus=stock`}
                    aria-label={`Update stock of ${product.name}`}
                  />
                }
              />
            ))}
          </List>
        ) : (
          <Empty
            icon="CircleCheck"
            title="Nothing needs attention"
            text="No product is low on stock."
          />
        )}
      </section>
    </div>
  )
}
