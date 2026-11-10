import type { AdminStockFilter } from '@/api/queries/admin/catalogue'
import { optionalOneOf, optionalPage, optionalString } from '@/lib/search-params'

export interface AdminProductsSearch {
  q?: string | undefined
  category?: string | undefined
  stock?: AdminStockFilter | undefined
  page?: number | undefined
  saved?: string | undefined
}

export const STOCK_OPTIONS: Array<{ value: AdminStockFilter | ''; label: string }> = [
  { value: '', label: 'All stock levels' },
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
]

const STOCK_FILTERS: readonly AdminStockFilter[] = ['in', 'low', 'out']

export const parseAdminProductsSearch = (search: Record<string, unknown>): AdminProductsSearch => ({
  q: optionalString(search.q),
  category: optionalString(search.category),
  stock: optionalOneOf(search.stock, STOCK_FILTERS),
  page: optionalPage(search.page),
  saved: optionalString(search.saved),
})

export interface EditProductSearch {
  focus?: string | undefined
}

export const parseEditProductSearch = (search: Record<string, unknown>): EditProductSearch => ({
  focus: optionalString(search.focus),
})
