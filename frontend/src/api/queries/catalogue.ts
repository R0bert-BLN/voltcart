import type { ProductData } from '@/api/generated/types'
import type { IconName } from '@/components/ui/icon'
import { categories, deliveryMethods, products, type Category, type DeliveryMethod, type Product } from '@/lib/mock-data'

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
