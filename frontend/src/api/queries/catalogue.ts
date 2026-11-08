import type { ProductData } from '@/api/generated/types'
import type { IconName } from '@/components/ui/icon'
import { useMemo } from 'react'
import { categories, deliveryMethods, products, suppliers, type Category, type DeliveryMethod, type Product, type Supplier } from '@/lib/mock-data'

/** The data layer keeps kebab-case lucide names; the Icon types them. */
export const asIconName = (name: string): IconName => name as IconName

/** A category on the home carousel, with the products it holds. */
export interface HomeCategory extends Category {
  productsCount: number
}

/** Stock level, same thresholds the backend applies (StockStatus::fromStock). */
export const stockStatusOf = (stock: number): ProductData['stockStatus'] =>
  stock <= 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'in_stock'

/** Maps a catalogue record onto the generated product DTO, so the shared
    product components take it while the screens run on the local data. */
export function toProductData(product: Product): ProductData {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.price * 100,
    stock: product.stock,
    image: `products/${product.id}.jpg`,
    stockStatus: stockStatusOf(product.stock),
    specs: product.specs.map(([label, value]) => ({ label, value })),
    supplier: null,
    deliveryMethods: [],
    categoryId: product.categoryId,
    categoryName: categories.find((category) => category.id === product.categoryId)?.name ?? null,
  }
}

/** The six store categories, in data order, each with its product count. */
export function useCategories(): HomeCategory[] {
  return categories.map((category) => ({
    ...category,
    productsCount: products.filter((product) => product.categoryId === category.id).length,
  }))
}

/** The popular products of the catalogue, capped as the home screen asks. */
export function usePopularProducts(limit = 8): ProductData[] {
  return products.filter((product) => product.popular).slice(0, limit).map(toProductData)
}

/** The delivery methods the service strip advertises. */
export function useDeliveryMethods(): DeliveryMethod[] {
  return deliveryMethods
}

/** The five supplier companies, for the supplier filter of the list. */
export function useSuppliers(): Supplier[] {
  return suppliers
}

/** Sort orders of the product list, as in the mockup's sorters. */
export type CatalogueSort = 'recommended' | 'price-asc' | 'price-desc' | 'name'

/** Filters of the product list, straight from the screen's search params. */
export interface CatalogueFilters {
  q?: string
  /** Comma-separated category, supplier and delivery-method ids. */
  category?: string
  supplier?: string
  delivery?: string
  min?: string
  max?: string
  stockOnly?: boolean
  sort?: CatalogueSort
}

const SORTERS: Record<CatalogueSort, (a: Product, b: Product) => number> = {
  recommended: (a, b) =>
    (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0) ||
    (b.popular ? 1 : 0) - (a.popular ? 1 : 0) ||
    a.name.localeCompare(b.name),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
}

/** The comma-separated ids of one search parameter. */
const csvIds = (value?: string): string[] => (value ?? '').split(',').filter(Boolean)

/** The product list for one set of filters, sorted and grid-ready. */
export function useFilteredProducts(filters: CatalogueFilters): ProductData[] {
  const { q, category, supplier, delivery, min, max, stockOnly = false, sort = 'recommended' } = filters

  return useMemo(() => {
    const query = (q ?? '').trim().toLowerCase()
    const minPrice = min ? Number(min) : null
    const maxPrice = max ? Number(max) : null
    const found = products.filter(
      (product) =>
        (!query || `${product.name} ${product.description}`.toLowerCase().includes(query)) &&
        (!category || csvIds(category).includes(product.categoryId)) &&
        (!supplier || csvIds(supplier).includes(product.supplierId)) &&
        (!delivery || csvIds(delivery).some((id) => product.deliveryIds.includes(id))) &&
        (minPrice === null || Number.isNaN(minPrice) || product.price >= minPrice) &&
        (maxPrice === null || Number.isNaN(maxPrice) || product.price <= maxPrice) &&
        (!stockOnly || product.stock > 0),
    )
    return (SORTERS[sort] ? found.sort(SORTERS[sort]) : found).map(toProductData)
  }, [q, category, supplier, delivery, min, max, stockOnly, sort])
}

/** How many products each category, supplier and delivery method holds, for
    the counts next to the filter checks of the list screen. */
export function useFilterCounts(): Record<string, number> {
  return useMemo(() => {
    const counts: Record<string, number> = {}
    for (const product of products) {
      for (const id of [product.categoryId, product.supplierId, ...product.deliveryIds]) {
        counts[id] = (counts[id] ?? 0) + 1
      }
    }
    return counts
  }, [])
}

