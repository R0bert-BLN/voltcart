import { describe, expect, it } from 'vitest'

import { categories, deliveryMethods, orders, products, suppliers, users } from './mock-data'

const uniqueIds = (list: { id: string }[]) => new Set(list.map((record) => record.id)).size

describe('mock-data', () => {
  it('has a single record per entity id', () => {
    expect(uniqueIds(users)).toBe(users.length)
    expect(uniqueIds(categories)).toBe(categories.length)
    expect(uniqueIds(suppliers)).toBe(suppliers.length)
    expect(uniqueIds(deliveryMethods)).toBe(deliveryMethods.length)
    expect(uniqueIds(orders)).toBe(orders.length)
    expect(uniqueIds(products)).toBe(products.length)
  })

  it('references categories and suppliers that exist', () => {
    const categoryIds = new Set(categories.map((c) => c.id))
    const supplierIds = new Set(suppliers.map((s) => s.id))

    for (const product of products) {
      expect(categoryIds.has(product.categoryId), product.id).toBe(true)
      expect(supplierIds.has(product.supplierId), product.id).toBe(true)
      expect(product.stock).toBeGreaterThanOrEqual(0)
    }
  })

  it('references delivery methods that exist', () => {
    const deliveryIds = new Set(deliveryMethods.map((d) => d.id))

    for (const order of orders) {
      expect(deliveryIds.has(order.deliveryId), order.id).toBe(true)
    }
  })

  it('keeps the shapes the screens rely on', () => {
    for (const user of users) {
      expect(user.role).toBeTypeOf('string')
      expect(user.email).toContain('@')
    }

    for (const product of products) {
      expect(product.price).toBeGreaterThan(0)
      expect(product.description).toBeTypeOf('string')
      for (const [label, value] of product.specs) {
        expect(label).toBeTypeOf('string')
        expect(value).toBeTypeOf('string')
      }
    }

    for (const order of orders) {
      expect(order.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      for (const item of order.items) {
        expect(products.some((p) => p.id === item.id), item.id).toBe(true)
        expect(item.qty).toBeGreaterThan(0)
      }
    }
  })
})
