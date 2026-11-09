import type { CatalogueSort } from '@/api/queries/catalogue'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { Breadcrumb } from '@/components/common/breadcrumb'
import { Button } from '@/components/common/button'
import { Check } from '@/components/forms/check'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/forms/field'
import { FilterGroup } from '@/components/forms/filter-group'
import { PageHead } from '@/components/common/page-head'
import { Pagination } from '@/components/common/pagination'
import { ProductGrid } from '@/components/catalogue/product-grid'
import { Select } from '@/components/forms/select'
import { showToast } from '@/lib/toasts'
import {
  useFilterCounts,
  useCategories,
  useDeliveryMethods,
  useFilteredProducts,
  useSuppliers,
} from '@/api/queries/catalogue'

/** The list's filters as they live in the address bar. */
interface ProductsSearch {
  q?: string | undefined
  category?: string | undefined
  supplier?: string | undefined
  delivery?: string | undefined
  min?: string | undefined
  max?: string | undefined
  stock?: true | undefined
  sort?: CatalogueSort | undefined
  page?: number | undefined
}

/** One page of the grid, as in the mockup's PAGE_SIZE. */
const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
] as const

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

const csvIds = (value?: string): string[] => (value ?? '').split(',').filter(Boolean)

/** catalog-list: the list head with result count, the filter sidebar, the
    sorted grid and the pagination; every filter lives in the address bar, so
    Back from a product returns to the same results. */
export const Route = createFileRoute('/products/')({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => ({
    q: typeof search.q === 'string' && search.q !== '' ? search.q : undefined,
    category: typeof search.category === 'string' && search.category !== '' ? search.category : undefined,
    supplier: typeof search.supplier === 'string' && search.supplier !== '' ? search.supplier : undefined,
    delivery: typeof search.delivery === 'string' && search.delivery !== '' ? search.delivery : undefined,
    min: typeof search.min === 'string' && search.min !== '' ? search.min : undefined,
    max: typeof search.max === 'string' && search.max !== '' ? search.max : undefined,
    stock: search.stock === '1' || search.stock === true ? true : undefined,
    sort: typeof search.sort === 'string' && SORT_OPTIONS.some((o) => o.value === search.sort)
      ? (search.sort as CatalogueSort)
      : undefined,
    page: typeof search.page === 'string' && search.page !== '' ? Number(search.page) : undefined,
  }),
  component: ProductListScreen,
})

function ProductListScreen() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const counts = useFilterCounts()
  const categories = useCategories()
  const suppliers = useSuppliers()
  const deliveryMethods = useDeliveryMethods()
  const comingInReportII = () => showToast('Coming in Report II')

  const found = useFilteredProducts({
    q: search.q,
    category: search.category,
    supplier: search.supplier,
    delivery: search.delivery,
    min: search.min,
    max: search.max,
  })
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE))
  const page = Math.max(1, Math.min(search.page ?? 1, pages))
  const items = found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  /** Keeps the active filters in the address, so Back from a product returns
      to the same results. */
  const patchSearch = (patch: Partial<ProductsSearch>) =>
    navigate({ to: '/products', search: { ...search, ...patch }, replace: true })

  const toggle = (key: 'category' | 'supplier' | 'delivery', id: string) => {
    const selected = new Set(csvIds(search[key]))
    if (selected.has(id)) selected.delete(id)
    else selected.add(id)
    patchSearch({ [key]: [...selected].join(',') || undefined })
  }

  const clearFilters = () => navigate({ to: '/products', search: {}, replace: true })

  const title = search.q ? 'Search results' : (singleCategory()?.name ?? 'All products')
  const countLine = `${plural(found.length, 'product')}${search.q ? ` for "${search.q}"` : ''}`

  /** One checkbox row of the sidebar, with its product count. */
  const filterCheck = (key: 'category' | 'supplier' | 'delivery', id: string, label: string) => (
    <Check
      key={id}
      name={key}
      value={id}
      checked={csvIds(search[key]).includes(id)}
      onChange={() => toggle(key, id)}
      label={
        <span className="flex flex-1 items-center justify-between gap-2">
          {label}
          <span className="tabular-nums text-text-muted">{counts[id] ?? 0}</span>
        </span>
      }
    />
  )

  /** One decided category names the page (mockup catalogue.category). */
  function singleCategory() {
    if (search.q || csvIds(search.category).length !== 1) return undefined
    return categories.find((category) => category.id === csvIds(search.category)[0])
  }

  const sortSelect = (
    <Select
      label="Sort by"
      name="sort"
      value={search.sort ?? 'recommended'}
      options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
      onChange={(event) => patchSearch({ sort: event.target.value as CatalogueSort, page: undefined })}
    />
  )

  return (
    <div className="flex flex-col gap-(--sp-6)">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'All products' },
          ...(singleCategory() ? [{ label: singleCategory()!.name }] : []),
        ]}
      />
      <PageHead title={title} subtitle={countLine} actions={sortSelect} />
      <div className="grid gap-(--sp-6) lg:grid-cols-[14rem_1fr] lg:items-start">
        <form aria-label="Filter products" className="flex flex-col gap-(--sp-4)" onSubmit={(event) => event.preventDefault()}>
          <FilterGroup title="Category">{categories.map((c) => filterCheck('category', c.id, c.name))}</FilterGroup>
          <FilterGroup title="Price (€)">
            <div className="grid grid-cols-2 gap-(--sp-2)">
              <Field
                label="From"
                name="min"
                type="number"
                inputMode="decimal"
                value={search.min ?? ''}
                onChange={(event) => patchSearch({ min: event.target.value || undefined, page: undefined })}
              />
              <Field
                label="To"
                name="max"
                type="number"
                inputMode="decimal"
                value={search.max ?? ''}
                onChange={(event) => patchSearch({ max: event.target.value || undefined, page: undefined })}
              />
            </div>
          </FilterGroup>
          <FilterGroup title="Supplier">{suppliers.map((s) => filterCheck('supplier', s.id, s.name))}</FilterGroup>
          <FilterGroup title="Delivery">{deliveryMethods.map((d) => filterCheck('delivery', d.id, d.name))}</FilterGroup>
          <FilterGroup title="Availability">
            <Check
              name="stock"
              label="In stock only"
              checked={search.stock ?? false}
              onChange={(event) => patchSearch({ stock: event.target.checked || undefined, page: undefined })}
            />
          </FilterGroup>
          <Button variant="ghost block" label="Clear filters" onClick={clearFilters} />
        </form>
        <section aria-label="Products">
          {items.length > 0 ? (
            <ProductGrid products={items} onAdd={comingInReportII} onWish={comingInReportII} />
          ) : (
            <Empty
              icon="SearchX"
              title="No products match"
              text="Try removing a filter or changing your search."
            />
          )}
        </section>
      </div>
      {pages > 1 ? (
        <Pagination
          current={page}
          total={pages}
          onPageChange={(next) => patchSearch({ page: next === 1 ? undefined : next })}
        />
      ) : null}
    </div>
  )
}
