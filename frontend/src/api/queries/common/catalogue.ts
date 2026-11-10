import type { ProductData, StockStatus } from '@/api/generated/types'
import { useDemoChange, visibleProducts } from '@/api/demo/catalogue-store'
import { toIconName, type IconName } from '@/lib/icons'
import {
  categories,
  deliveryMethods,
  suppliers,
  type Product,
  type Supplier,
} from '@/lib/mock-data'

export type CatalogueSort = 'recommended' | 'price-asc' | 'price-desc' | 'name'

export interface CatalogueFilters {
  q?: string | undefined
  category?: string | undefined
  supplier?: string | undefined
  delivery?: string | undefined
  min?: string | undefined
  max?: string | undefined
  sort?: CatalogueSort | undefined
}

export interface CategoryOption {
  id: string
  name: string
  icon: IconName
  productsCount: number
}

export interface DeliveryOption {
  id: string
  name: string
  priceCents: number
  time: string
  days: number
  icon: IconName
}

export interface ProductDetails {
  product: ProductData
  supplier: Supplier
  deliveryMethods: DeliveryOption[]
}

const LOW_STOCK_LIMIT = 5

const DELIVERY_OPTIONS: DeliveryOption[] = deliveryMethods.map((method) => ({
  id: method.id,
  name: method.name,
  priceCents: Math.round(method.price * 100),
  time: method.time,
  days: method.days,
  icon: toIconName(method.icon),
}))

export const stockStatusOf = (stock: number): StockStatus =>
  stock <= 0 ? 'out_of_stock' : stock <= LOW_STOCK_LIMIT ? 'low_stock' : 'in_stock'

const flag = (value: boolean | undefined): number => (value ? 1 : 0)

const SORTERS: Record<CatalogueSort, (a: Product, b: Product) => number> = {
  recommended: (a, b) =>
    flag(b.stock > 0) - flag(a.stock > 0) ||
    flag(b.popular) - flag(a.popular) ||
    a.name.localeCompare(b.name),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
}

const csvIds = (value?: string): string[] => (value ?? '').split(',').filter(Boolean)

export const categoryName = (categoryId: string): string | null =>
  categories.find((category) => category.id === categoryId)?.name ?? null

export const supplierOf = (product: Product): Supplier =>
  suppliers.find((supplier) => supplier.id === product.supplierId)!

export const toProductData = (product: Product): ProductData => ({
  id: product.id,
  name: product.name,
  description: product.description,
  priceCents: Math.round(product.price * 100),
  stock: product.stock,
  image: `products/${product.id}.jpg`,
  stockStatus: stockStatusOf(product.stock),
  specs: product.specs.map(([label, value]) => ({ label, value })),
  supplier: null,
  deliveryMethods: [],
  categoryId: product.categoryId,
  categoryName: categoryName(product.categoryId),
})

const matchesFilters = (product: Product, filters: CatalogueFilters): boolean => {
  const query = (filters.q ?? '').trim().toLowerCase()
  const min = filters.min ? Number(filters.min) : Number.NaN
  const max = filters.max ? Number(filters.max) : Number.NaN
  const categoryIds = csvIds(filters.category)
  const supplierIds = csvIds(filters.supplier)
  const deliveryIds = csvIds(filters.delivery)

  return (
    (!query || `${product.name} ${product.description}`.toLowerCase().includes(query)) &&
    (categoryIds.length === 0 || categoryIds.includes(product.categoryId)) &&
    (supplierIds.length === 0 || supplierIds.includes(product.supplierId)) &&
    (deliveryIds.length === 0 || deliveryIds.some((id) => product.deliveryIds.includes(id))) &&
    (Number.isNaN(min) || product.price >= min) &&
    (Number.isNaN(max) || product.price <= max)
  )
}

export function useCategories(): CategoryOption[] {
  useDemoChange()
  const catalogue = visibleProducts()

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: toIconName(category.icon),
    productsCount: catalogue.filter((product) => product.categoryId === category.id).length,
  }))
}

export function usePopularProducts(limit: number): ProductData[] {
  useDemoChange()
  return visibleProducts()
    .filter((product) => product.popular)
    .slice(0, limit)
    .map(toProductData)
}

export const useDeliveryMethods = (): DeliveryOption[] => DELIVERY_OPTIONS

export const useSuppliers = (): Supplier[] => suppliers

export function useFilteredProducts(filters: CatalogueFilters): ProductData[] {
  useDemoChange()
  const sorter = SORTERS[filters.sort ?? 'recommended']

  return visibleProducts()
    .filter((product) => matchesFilters(product, filters))
    .sort(sorter)
    .map(toProductData)
}

export function useFilterCounts(): Record<string, number> {
  useDemoChange()
  const counts: Record<string, number> = {}

  for (const product of visibleProducts()) {
    for (const id of [product.categoryId, product.supplierId, ...product.deliveryIds]) {
      counts[id] = (counts[id] ?? 0) + 1
    }
  }
  return counts
}

export function useProduct(id: string): Product | undefined {
  useDemoChange()
  return visibleProducts().find((product) => product.id === id)
}

export function useProductDetails(id: string): ProductDetails | undefined {
  const product = useProduct(id)
  if (!product) return undefined

  return {
    product: toProductData(product),
    supplier: supplierOf(product),
    deliveryMethods: DELIVERY_OPTIONS.filter((method) => product.deliveryIds.includes(method.id)),
  }
}
