import type { ProductData } from '@/api/generated/types'
import type { CatalogueSort } from '@/api/queries/common/catalogue'
import { Button } from '@/components/common/button'
import { Empty } from '@/components/common/empty'
import { Pagination } from '@/components/common/pagination'
import { ProductGrid } from '@/components/client/product-grid'
import { Check } from '@/components/forms/check'
import { Field } from '@/components/forms/field'
import { FilterGroup } from '@/components/forms/filter-group'
import { SearchField } from '@/components/forms/search-field'
import { Select } from '@/components/forms/select'

export type FilterKey = 'category' | 'supplier' | 'delivery'

export interface FilterOption {
  id: string
  label: string
  count: number
  checked: boolean
}

export interface ProductListViewProps {
  sort: CatalogueSort
  sortOptions: ReadonlyArray<{ value: CatalogueSort; label: string }>
  query: string
  categories: FilterOption[]
  suppliers: FilterOption[]
  deliveryMethods: FilterOption[]
  min: string
  max: string
  products: ProductData[]
  page: number
  pages: number
  onQueryChange: (query: string) => void
  onSortChange: (sort: CatalogueSort) => void
  onToggleFilter: (key: FilterKey, id: string) => void
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  onClearFilters: () => void
  onPageChange: (page: number) => void
  wishedIds: readonly string[]
  onAdd: (product: ProductData) => void
  onWish: (product: ProductData) => void
}

interface FilterChecksProps {
  filterKey: FilterKey
  options: FilterOption[]
  onToggle: (key: FilterKey, id: string) => void
}

function FilterChecks({ filterKey, options, onToggle }: FilterChecksProps) {
  return options.map((option) => (
    <Check
      key={option.id}
      name={filterKey}
      value={option.id}
      checked={option.checked}
      onChange={() => onToggle(filterKey, option.id)}
      label={
        <span className="flex flex-1 items-center justify-between gap-2">
          {option.label}
          <span className="tabular-nums text-text-muted">{option.count}</span>
        </span>
      }
    />
  ))
}

export function ProductListView({
  sort,
  sortOptions,
  query,
  categories,
  suppliers,
  deliveryMethods,
  min,
  max,
  products,
  page,
  pages,
  onQueryChange,
  onSortChange,
  onToggleFilter,
  onMinChange,
  onMaxChange,
  onClearFilters,
  onPageChange,
  wishedIds,
  onAdd,
  onWish,
}: ProductListViewProps) {
  return (
    <div className="flex flex-col gap-(--sp-6)">
      <h1 className="sr-only">Products</h1>
      <div className="grid gap-(--sp-6) lg:grid-cols-[14rem_1fr] lg:items-start">
        <form
          aria-label="Filter products"
          className="flex flex-col gap-(--sp-4)"
          onSubmit={(event) => event.preventDefault()}
        >
          <FilterGroup title="Category">
            <FilterChecks filterKey="category" options={categories} onToggle={onToggleFilter} />
          </FilterGroup>
          <FilterGroup title="Price (€)">
            <div className="grid grid-cols-2 gap-(--sp-2)">
              <Field
                label="From"
                name="min"
                type="number"
                inputMode="decimal"
                value={min}
                onChange={(event) => onMinChange(event.target.value)}
              />
              <Field
                label="To"
                name="max"
                type="number"
                inputMode="decimal"
                value={max}
                onChange={(event) => onMaxChange(event.target.value)}
              />
            </div>
          </FilterGroup>
          <FilterGroup title="Supplier">
            <FilterChecks filterKey="supplier" options={suppliers} onToggle={onToggleFilter} />
          </FilterGroup>
          <FilterGroup title="Delivery">
            <FilterChecks filterKey="delivery" options={deliveryMethods} onToggle={onToggleFilter} />
          </FilterGroup>
          <Button variant="ghost block" label="Clear filters" onClick={onClearFilters} />
        </form>
        <div className="flex min-w-0 flex-col gap-(--sp-6)">
          <div className="flex flex-wrap items-end justify-between gap-(--sp-4)">
            <SearchField
              label="Search"
              hideLabel
              name="q"
              placeholder="Search products"
              value={query}
              onSearch={onQueryChange}
              className="w-full sm:max-w-sm sm:flex-1"
            />
            <Select
              label="Sort by"
              name="sort"
              value={sort}
              options={[...sortOptions]}
              onValueChange={(value) => onSortChange(value as CatalogueSort)}
            />
          </div>
          <section aria-label="Products">
            {products.length > 0 ? (
              <ProductGrid products={products} wishedIds={wishedIds} onAdd={onAdd} onWish={onWish} />
            ) : (
              <Empty
                icon="SearchX"
                title="No products match"
                text="Try removing a filter or changing your search."
              />
            )}
          </section>
        </div>
      </div>
      {pages > 1 ? <Pagination current={page} total={pages} onPageChange={onPageChange} /> : null}
    </div>
  )
}
