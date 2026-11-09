import type { AdminStockFilter } from '@/api/queries/catalogue'
import { asIconName, deleteProduct, useAdminProducts, useCategories } from '@/api/queries/catalogue'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/forms/field'
import { PageHead } from '@/components/common/page-head'
import { Pagination } from '@/components/common/pagination'
import { ProductCell } from '@/components/catalogue/product-cell'
import { Select } from '@/components/forms/select'
import { Sheet } from '@/components/admin/sheet'
import { StockBadge } from '@/components/catalogue/stock-badge'
import { Table } from '@/components/common/table'
import { formatPrice } from '@/lib/format'
import { showToast } from '@/lib/toasts'

/** The screen's filters and result position as they live in the address bar,
    so the dashboard's stock tiles land filtered and a saved product's keep
    survives the round trip from the form. */
interface AdminProductsSearch {
  q?: string | undefined
  category?: string | undefined
  stock?: AdminStockFilter | undefined
  page?: number | undefined
  /** Id of the product a form just saved; its row is highlighted. */
  saved?: string | undefined
}

const STOCK_OPTIONS: Array<{ value: AdminStockFilter | ''; label: string }> = [
  { value: '', label: 'All stock levels' },
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
]

/** One page of the table, as in the mockup's PAGE_SIZE. */
const PAGE_SIZE = 10

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** admin-products: the products table. The toolbar narrows the table live,
    Delete asks for confirmation and removes the product from the catalogue,
    the cart and the wish list. */
export const Route = createFileRoute('/admin/products/')({
  validateSearch: (search: Record<string, unknown>): AdminProductsSearch => ({
    q: typeof search.q === 'string' && search.q !== '' ? search.q : undefined,
    category:
      typeof search.category === 'string' && search.category !== '' ? search.category : undefined,
    stock: typeof search.stock === 'string' && ['in', 'low', 'out'].includes(search.stock)
      ? (search.stock as AdminStockFilter)
      : undefined,
    page: typeof search.page === 'number' && Number.isInteger(search.page)
      ? search.page
      : typeof search.page === 'string' && search.page !== ''
        ? Number(search.page)
        : undefined,
    saved: typeof search.saved === 'string' && search.saved !== '' ? search.saved : undefined,
  }),
  component: AdminProductsScreen,
})

function AdminProductsScreen() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const categories = useCategories()
  const addButton = useRef<HTMLElement>(null)
  /** The product waiting behind the delete dialog; null keeps it closed. */
  const [toDeleteId, setToDeleteId] = useState<string | null>(null)

  const found = useAdminProducts({ q: search.q, category: search.category, stock: search.stock })
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE))
  /** The saved row opens its page so the highlight is on screen. */
  const savedIndex = search.saved ? found.findIndex(({ product }) => product.id === search.saved) : -1
  const requestedPage = savedIndex >= 0 ? Math.floor(savedIndex / PAGE_SIZE) + 1 : (search.page ?? 1)
  const page = Math.max(1, Math.min(requestedPage, pages))
  const items = found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const toDelete = toDeleteId ? found.find(({ product }) => product.id === toDeleteId) : undefined

  const patchSearch = (patch: Partial<AdminProductsSearch>) =>
    navigate({ to: '/admin/products', search: { ...search, ...patch }, replace: true })

  const clearFilters = () => navigate({ to: '/admin/products', search: {}, replace: true })

  const confirmDelete = () => {
    if (!toDelete) return
    deleteProduct(toDelete.product.id)
    setToDeleteId(null)
    showToast(`${toDelete.product.name} deleted.`)
    addButton.current?.focus()
  }

  const columns = [
    { label: 'Product' },
    { label: 'Category' },
    { label: 'Price', num: true },
    { label: 'Stock', num: true },
    { label: 'Supplier' },
    { label: 'Actions', num: true },
  ]

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <PageHead
        title="Products"
        actions={
          <Button
            // The router renders an anchor for a href button; the mockup
            // returns focus here after the delete dialog is confirmed.
            ref={addButton as React.Ref<HTMLButtonElement>}
            label="Add product"
            icon={asIconName('plus')}
            href="/admin/products/new"
          />
        }
      />
      <form
        aria-label="Filter products"
        className="grid gap-(--sp-3) items-end sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <Field
          label="Search"
          name="q"
          type="search"
          placeholder="Name, description, category or supplier"
          value={search.q ?? ''}
          onChange={(event) => patchSearch({ q: event.target.value || undefined, page: undefined })}
        />
        <Select
          label="Category"
          name="category"
          value={search.category ?? ''}
          options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          onChange={(event) => patchSearch({ category: event.target.value || undefined, page: undefined })}
        />
        <Select
          label="Stock"
          name="stock"
          value={search.stock ?? ''}
          options={STOCK_OPTIONS}
          onChange={(event) =>
            patchSearch({ stock: (event.target.value || undefined) as AdminProductsSearch['stock'], page: undefined })
          }
        />
      </form>
      <p role="status" data-slot="result-count" className="text-text-muted">
        {plural(found.length, 'product')}
      </p>
      <section aria-label="Products" className="flex min-w-0 flex-col gap-(--sp-5)">
        {items.length > 0 ? (
          <>
            <Table
              columns={columns}
              rows={items.map(({ product, supplierName }) => ({
                cells: [
                  <ProductCell key="cell" product={product} href={`/admin/products/${product.id}/edit`} />,
                  product.categoryName ?? '',
                  formatPrice(product.priceCents),
                  <span
                    key="stock"
                    className="inline-flex items-center justify-end gap-(--sp-2) tabular-nums"
                  >
                    {product.stock}
                    <StockBadge product={product} admin />
                  </span>,
                  supplierName,
                  <div key="actions" className="flex justify-end gap-(--sp-2)">
                    <Button
                      label="Edit"
                      variant="ghost"
                      href={`/admin/products/${product.id}/edit`}
                      aria-label={`Edit ${product.name}`}
                      className="px-(--sp-3) text-(--fs-sm) min-h-(--control-sm)"
                    />
                    <Button
                      label="Delete"
                      variant="ghost"
                      onClick={() => setToDeleteId(product.id)}
                      aria-label={`Delete ${product.name}`}
                      className="px-(--sp-3) text-(--fs-sm) min-h-(--control-sm) text-danger"
                    />
                  </div>,
                ],
                ...(product.id === search.saved ? { className: 'bg-primary-soft' } : {}),
              }))}
            />
            {pages > 1 ? (
              <Pagination
                current={page}
                total={pages}
                onPageChange={(next) => patchSearch({ page: next === 1 ? undefined : next })}
              />
            ) : null}
          </>
        ) : (
          <Empty
            icon="SearchX"
            title="No products match"
            text="Try another search or filter."
            action={<Button label="Clear filters" onClick={clearFilters} />}
          />
        )}
      </section>
      <Sheet
        title="Delete product"
        open={toDelete !== undefined}
        onOpenChange={(open) => setToDeleteId(open ? toDeleteId : null)}
      >
        <p>
          Delete <strong>{toDelete?.product.name}</strong>? It is removed from the catalogue, the
          cart and the wish list.
        </p>
        <div className="flex justify-end gap-(--sp-2)">
          <Button label="Cancel" variant="ghost" onClick={() => setToDeleteId(null)} />
          <Button label="Delete product" variant="danger" onClick={confirmDelete} />
        </div>
      </Sheet>
    </div>
  )
}
