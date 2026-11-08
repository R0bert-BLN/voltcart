import type { ProductData } from '@/api/generated/types'
import type { IconName } from '@/components/ui/icon'
import { useSyncExternalStore } from 'react'
import { categories, demoToday, deliveryMethods, products, suppliers, users, type Category, type DeliveryMethod, type Product, type ProductSpec, type Supplier } from '@/lib/mock-data'

/** The data layer keeps kebab-case lucide names; the Icon types them. */
export const asIconName = (name: string): IconName => name as IconName

/** Demo changes an admin makes live outside the shipped records: deletions
    are kept by id here and applied by every catalogue hook, so they survive
    navigation and stay visible in the store too, until the page reloads. */
const deletedIds = new Set<string>()
/** The products the forms added, newest first, shown above the shipped ones. */
const addedProducts: Product[] = []
const listeners = new Set<() => void>()
let version = 0

const emitChange = () => {
  version += 1
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Re-renders the calling component whenever a demo change lands. */
export function useDemoChange(): number {
  return useSyncExternalStore(subscribe, () => version)
}

/** The catalogue without the products an admin deleted. */
const visibleProducts = (): Product[] =>
  [...addedProducts, ...products].filter((product) => !deletedIds.has(product.id))

/** Deletes one product from the demo catalogue, and with it the cart lines
    and wish-list entries that point at the product (mockup MK.catalog.remove). */
export function deleteProduct(id: string): void {
  deletedIds.add(id)
  for (const user of users) {
    if (user.cart) user.cart = user.cart.filter((entry) => entry.id !== id)
    if (user.wishlist) user.wishlist = user.wishlist.filter((entry) => entry !== id)
  }
  emitChange()
}

/** The validated fields the product form submits, in the data layer's shape. */
export interface NewProductInput {
  name: string
  description: string
  specs: ProductSpec[]
  /** Price in euros, as the shipped data keeps it. */
  price: number
  stock: number
  supplierId: string
  categoryId: string
  deliveryIds: string[]
}

/** Adds one product to the demo catalogue (mockup MK.catalog.add): it shows
    in the admin table and the store straight away, until the page reloads. */
export function addProduct(input: NewProductInput): Product {
  const product: Product = { ...input, id: `new-${Date.now()}`, updated: demoToday }
  addedProducts.unshift(product)
  emitChange()
  return product
}

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
  useDemoChange()
  return categories.map((category) => ({
    ...category,
    productsCount: visibleProducts().filter((product) => product.categoryId === category.id).length,
  }))
}

/** The popular products of the catalogue, capped as the home screen asks. */
export function usePopularProducts(limit = 8): ProductData[] {
  useDemoChange()
  return visibleProducts().filter((product) => product.popular).slice(0, limit).map(toProductData)
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
  useDemoChange()

  const query = (q ?? '').trim().toLowerCase()
  const minPrice = min ? Number(min) : null
  const maxPrice = max ? Number(max) : null
  const found = visibleProducts().filter(
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
}

/** How many products each category, supplier and delivery method holds, for
    the counts next to the filter checks of the list screen. */
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

/** One product of the catalogue, undefined when the id is unknown. */
export function useProduct(id: string): Product | undefined {
  useDemoChange()
  return visibleProducts().find((product) => product.id === id)
}

/** The company that supplies one product, for the supplier card of the
    details screen. */
export function productSupplier(product: Product): Supplier {
  return suppliers.find((supplier) => supplier.id === product.supplierId)!
}

/** One row of the overview's Needs attention list: the product with the name
    of its supplier for the row's subtitle. */
export interface AttentionRow {
  product: ProductData
  supplierName: string
}

/** The admin overview's numbers and Needs attention rows, as in the mockup's
    screen: count tiles plus the low-stock products, rarest stock first, their
    out-of-stock siblings counted for the fourth tile. */
export function useAdminOverview(): {
  productsCount: number
  categoriesCount: number
  lowStock: AttentionRow[]
  outOfStockCount: number
} {
  useDemoChange()
  const catalogue = visibleProducts()
  const stockOf = (product: Product) => stockStatusOf(product.stock)
  const lowStock = catalogue
    .filter((product) => stockOf(product) === 'low_stock')
    .sort((a, b) => a.stock - b.stock)

  return {
    productsCount: catalogue.length,
    categoriesCount: categories.length,
    lowStock: lowStock.map((product) => ({
      product: toProductData(product),
      supplierName: productSupplier(product).name,
    })),
    outOfStockCount: catalogue.filter((product) => stockOf(product) === 'out_of_stock').length,
  }
}

/** One row of the admin products table: the product with the name of its
    supplier for the Supplier cell. */
export interface AdminProductRow {
  product: ProductData
  supplierName: string
}

/** The stock levels of the admin products screen, as in the mockup's filter. */
export type AdminStockFilter = 'in' | 'low' | 'out'

/** The filters of the admin products table, straight from search params. */
export interface AdminProductFilters {
  q?: string
  category?: string
  stock?: AdminStockFilter
}

/** The products of the admin table for one set of filters, in data order.
    The search reads every field a person would type: name, description,
    category and supplier (mockup MK.catalog.matches). */
export function useAdminProducts(filters: AdminProductFilters): AdminProductRow[] {
  const { q, category, stock } = filters
  useDemoChange()

  const query = (q ?? '').trim().toLowerCase()
  const stockOf = (product: Product): AdminStockFilter => {
    const status = stockStatusOf(product.stock)
    return status === 'low_stock' ? 'low' : status === 'out_of_stock' ? 'out' : 'in'
  }
  return visibleProducts()
    .filter(
      (product) =>
        (!query ||
          [
            product.name,
            product.description,
            categories.find((c) => c.id === product.categoryId)?.name,
            suppliers.find((s) => s.id === product.supplierId)?.name,
          ].some((text) => (text ?? '').toLowerCase().includes(query))) &&
        (!category || product.categoryId === category) &&
        (!stock || stockOf(product) === stock),
    )
    .map((product) => ({
      product: toProductData(product),
      supplierName: productSupplier(product).name,
    }))
}

