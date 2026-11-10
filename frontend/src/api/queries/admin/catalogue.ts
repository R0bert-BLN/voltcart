import {
  addProduct,
  deleteProduct,
  demoAdminName,
  updateProduct,
  useDemoChange,
  visibleProducts,
  type ProductInput,
} from '@/api/demo/catalogue-store'
import type { ProductData } from '@/api/generated/types'
import {
  categoryName,
  stockStatusOf,
  supplierOf,
  toProductData,
} from '@/api/queries/common/catalogue'
import { categories, type Product } from '@/lib/mock-data'

export { addProduct, deleteProduct, demoAdminName, updateProduct }
export type { ProductInput }

export type AdminStockFilter = 'in' | 'low' | 'out'

export interface AdminProductFilters {
  q?: string | undefined
  category?: string | undefined
  stock?: AdminStockFilter | undefined
}

export interface ProductRow {
  product: ProductData
  supplierName: string
}

export interface AdminOverview {
  productsCount: number
  categoriesCount: number
  lowStock: ProductRow[]
  outOfStockCount: number
}

const adminStockOf = (stock: number): AdminStockFilter => {
  const status = stockStatusOf(stock)
  return status === 'low_stock' ? 'low' : status === 'out_of_stock' ? 'out' : 'in'
}

const toProductRow = (product: Product): ProductRow => ({
  product: toProductData(product),
  supplierName: supplierOf(product).name,
})

const matchesAdminFilters = (product: Product, filters: AdminProductFilters): boolean => {
  const query = (filters.q ?? '').trim().toLowerCase()
  const searchable = [
    product.name,
    product.description,
    categoryName(product.categoryId),
    supplierOf(product).name,
  ]

  return (
    (!query || searchable.some((text) => (text ?? '').toLowerCase().includes(query))) &&
    (!filters.category || product.categoryId === filters.category) &&
    (!filters.stock || adminStockOf(product.stock) === filters.stock)
  )
}

export function useAdminOverview(): AdminOverview {
  useDemoChange()
  const catalogue = visibleProducts()

  return {
    productsCount: catalogue.length,
    categoriesCount: categories.length,
    lowStock: catalogue
      .filter((product) => stockStatusOf(product.stock) === 'low_stock')
      .sort((a, b) => a.stock - b.stock)
      .map(toProductRow),
    outOfStockCount: catalogue.filter((product) => stockStatusOf(product.stock) === 'out_of_stock')
      .length,
  }
}

export function useAdminProducts(filters: AdminProductFilters): ProductRow[] {
  useDemoChange()
  return visibleProducts()
    .filter((product) => matchesAdminFilters(product, filters))
    .map(toProductRow)
}
