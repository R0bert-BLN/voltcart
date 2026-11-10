import { getRouteApi, useNavigate } from '@tanstack/react-router'

import {
  useCategories,
  useDeliveryMethods,
  useFilterCounts,
  useFilteredProducts,
  useSuppliers,
  type CatalogueSort,
} from '@/api/queries/common/catalogue'
import {
  ProductListView,
  type FilterKey,
  type FilterOption,
} from '@/containers/client/catalogue/product-list-view'
import { SORT_OPTIONS, type ProductsSearch } from '@/containers/client/catalogue/products-search'
import { useShoppingActions } from '@/containers/client/catalogue/use-shopping-actions'
import { splitIds } from '@/lib/search-params'

const route = getRouteApi('/products/')

const PAGE_SIZE = 12

interface NamedItem {
  id: string
  name: string
}

export function ProductListContainer() {
  const navigate = useNavigate()
  const search = route.useSearch()
  const counts = useFilterCounts()
  const categories = useCategories()
  const suppliers = useSuppliers()
  const deliveryMethods = useDeliveryMethods()
  const { wishedIds, addToCart, toggleWish } = useShoppingActions()

  const found = useFilteredProducts(search)
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE))
  const page = Math.max(1, Math.min(search.page ?? 1, pages))
  const products = found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const patchSearch = (patch: Partial<ProductsSearch>) =>
    navigate({ to: '/products', search: { ...search, ...patch }, replace: true })

  const resetPage = { page: undefined }

  const toggleFilter = (key: FilterKey, id: string) => {
    const selected = new Set(splitIds(search[key]))
    if (selected.has(id)) selected.delete(id)
    else selected.add(id)
    void patchSearch({ [key]: [...selected].join(',') || undefined, ...resetPage })
  }

  const toOptions = (items: NamedItem[], key: FilterKey): FilterOption[] => {
    const selected = splitIds(search[key])
    return items.map((item) => ({
      id: item.id,
      label: item.name,
      count: counts[item.id] ?? 0,
      checked: selected.includes(item.id),
    }))
  }

  return (
    <ProductListView
      sort={search.sort ?? 'recommended'}
      sortOptions={SORT_OPTIONS}
      query={search.q ?? ''}
      categories={toOptions(categories, 'category')}
      suppliers={toOptions(suppliers, 'supplier')}
      deliveryMethods={toOptions(deliveryMethods, 'delivery')}
      min={search.min ?? ''}
      max={search.max ?? ''}
      products={products}
      page={page}
      pages={pages}
      onQueryChange={(query) => void patchSearch({ q: query || undefined, ...resetPage })}
      onSortChange={(sort: CatalogueSort) => void patchSearch({ sort, ...resetPage })}
      onToggleFilter={toggleFilter}
      onMinChange={(value) => void patchSearch({ min: value || undefined, ...resetPage })}
      onMaxChange={(value) => void patchSearch({ max: value || undefined, ...resetPage })}
      onClearFilters={() => void navigate({ to: '/products', search: {}, replace: true })}
      onPageChange={(next) => void patchSearch({ page: next === 1 ? undefined : next })}
      wishedIds={wishedIds}
      onAdd={(product) => void addToCart(product.id)}
      onWish={(product) => toggleWish(product.id)}
    />
  )
}
