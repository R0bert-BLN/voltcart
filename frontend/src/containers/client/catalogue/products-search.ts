import type { CatalogueSort } from '@/api/queries/common/catalogue'
import { optionalOneOf, optionalPage, optionalString } from '@/lib/search-params'

export interface ProductsSearch {
  q?: string | undefined
  category?: string | undefined
  supplier?: string | undefined
  delivery?: string | undefined
  min?: string | undefined
  max?: string | undefined
  sort?: CatalogueSort | undefined
  page?: number | undefined
}

export const SORT_OPTIONS: ReadonlyArray<{ value: CatalogueSort; label: string }> = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
]

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value)

export const parseProductsSearch = (search: Record<string, unknown>): ProductsSearch => ({
  q: optionalString(search.q),
  category: optionalString(search.category),
  supplier: optionalString(search.supplier),
  delivery: optionalString(search.delivery),
  min: optionalString(search.min),
  max: optionalString(search.max),
  sort: optionalOneOf(search.sort, SORT_VALUES),
  page: optionalPage(search.page),
})
