import { useSyncExternalStore } from 'react'

import { demoToday, products, users, type Product, type ProductSpec } from '@/lib/mock-data'

export interface ProductInput {
  name: string
  description: string
  specs: ProductSpec[]
  price: number
  stock: number
  supplierId: string
  categoryId: string
  deliveryIds: string[]
}

const deletedIds = new Set<string>()
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

export const useDemoChange = (): number => useSyncExternalStore(subscribe, () => version)

export const visibleProducts = (): Product[] =>
  [...addedProducts, ...products].filter((product) => !deletedIds.has(product.id))

export function deleteProduct(id: string): void {
  deletedIds.add(id)
  for (const user of users) {
    if (user.cart) user.cart = user.cart.filter((entry) => entry.id !== id)
    if (user.wishlist) user.wishlist = user.wishlist.filter((entry) => entry !== id)
  }
  emitChange()
}

export function addProduct(input: ProductInput): Product {
  const product: Product = { ...input, id: `new-${Date.now()}`, updated: demoToday }
  addedProducts.unshift(product)
  emitChange()
  return product
}

export function updateProduct(id: string, input: ProductInput): Product | undefined {
  const product = [...addedProducts, ...products].find((candidate) => candidate.id === id)
  if (!product) return undefined
  Object.assign(product, input, { updated: demoToday })
  emitChange()
  return product
}

export const demoAdminName = (): string => users.find((user) => user.role === 'admin')!.name
