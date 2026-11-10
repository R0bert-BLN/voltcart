import type { AdminStockFilter, ProductRow } from '@/api/queries/admin/catalogue'
import { Button } from '@/components/common/button'
import { DeleteProductSheet } from '@/components/admin/delete-product-sheet'
import { Empty } from '@/components/common/empty'
import { PageHead } from '@/components/common/page-head'
import { Pagination } from '@/components/common/pagination'
import { ProductCell } from '@/components/common/product-cell'
import { StockBadge } from '@/components/common/stock-badge'
import { Table } from '@/components/common/table'
import { Field } from '@/components/forms/field'
import { Select } from '@/components/forms/select'
import { formatPrice, plural } from '@/lib/format'

export interface AdminProductsViewProps {
  rows: ProductRow[]
  totalCount: number
  query: string
  category: string
  stock: AdminStockFilter | ''
  categoryOptions: Array<{ value: string; label: string }>
  stockOptions: Array<{ value: AdminStockFilter | ''; label: string }>
  savedId: string | undefined
  page: number
  pages: number
  productToDelete: { id: string; name: string } | undefined
  onQueryChange: (query: string) => void
  onCategoryChange: (category: string) => void
  onStockChange: (stock: AdminStockFilter | '') => void
  onClearFilters: () => void
  onPageChange: (page: number) => void
  onDeleteRequest: (productId: string) => void
  onDeleteCancel: () => void
  onDeleteConfirm: () => void
}

const COLUMNS = [
  { label: 'Product' },
  { label: 'Category' },
  { label: 'Price', num: true },
  { label: 'Stock', num: true },
  { label: 'Supplier' },
  { label: 'Actions', num: true },
]

export function AdminProductsView({
  rows,
  totalCount,
  query,
  category,
  stock,
  categoryOptions,
  stockOptions,
  savedId,
  page,
  pages,
  productToDelete,
  onQueryChange,
  onCategoryChange,
  onStockChange,
  onClearFilters,
  onPageChange,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: AdminProductsViewProps) {
  const tableRows = rows.map(({ product, supplierName }) => ({
    cells: [
      <ProductCell key="cell" product={product} href={`/admin/products/${product.id}/edit`} />,
      product.categoryName ?? '',
      formatPrice(product.priceCents),
      <span key="stock" className="inline-flex items-center justify-end gap-(--sp-2) tabular-nums">
        {product.stock}
        <StockBadge product={product} admin />
      </span>,
      supplierName,
      <div key="actions" className="flex justify-end gap-(--sp-2)">
        <Button
          label="Edit"
          variant="ghost"
          compact
          href={`/admin/products/${product.id}/edit`}
          aria-label={`Edit ${product.name}`}
        />
        <Button
          label="Delete"
          variant="ghost"
          compact
          onClick={() => onDeleteRequest(product.id)}
          aria-label={`Delete ${product.name}`}
          className="text-danger"
        />
      </div>,
    ],
    ...(product.id === savedId ? { className: 'bg-primary-soft' } : {}),
  }))

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead
        title="Products"
        actions={
          <Button
            data-add-product
            label="Add product"
            icon="Plus"
            href="/admin/products/new"
          />
        }
      />
      <form
        aria-label="Filter products"
        className="grid items-end gap-(--sp-3) sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field
          label="Search"
          name="q"
          type="search"
          placeholder="Name, description, category or supplier"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <Select
          label="Category"
          name="category"
          value={category}
          options={categoryOptions}
          onValueChange={onCategoryChange}
        />
        <Select
          label="Stock"
          name="stock"
          value={stock}
          options={stockOptions}
          onValueChange={(value) => onStockChange(value as AdminStockFilter | '')}
        />
      </form>
      <p role="status" data-slot="result-count" className="text-text-muted">
        {plural(totalCount, 'product')}
      </p>
      <section aria-label="Products" className="flex min-w-0 flex-col gap-(--sp-5)">
        {rows.length > 0 ? (
          <>
            <Table columns={COLUMNS} rows={tableRows} />
            {pages > 1 ? <Pagination current={page} total={pages} onPageChange={onPageChange} /> : null}
          </>
        ) : (
          <Empty
            icon="SearchX"
            title="No products match"
            text="Try another search or filter."
            action={<Button label="Clear filters" onClick={onClearFilters} />}
          />
        )}
      </section>
      <DeleteProductSheet
        productName={productToDelete?.name}
        open={productToDelete !== undefined}
        onCancel={onDeleteCancel}
        onConfirm={onDeleteConfirm}
      />
    </div>
  )
}
