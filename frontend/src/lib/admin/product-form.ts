import type { ProductInput } from '@/api/demo/catalogue-store'
import type { Product, ProductSpec } from '@/lib/mock-data'

export interface ProductFormValues {
  name: string
  description: string
  price: number
  stock: number
  supplierId: string
  categoryId: string
  deliveryIds: string[]
  specs: Array<{ label: string; value: string }>
}

export interface ProductFormErrors {
  name?: string
  price?: string
  stock?: string
  supplierId?: string
  categoryId?: string
}

export type ProductFormField = keyof ProductFormErrors | 'deliveryIds'

export type ProductFormResult =
  | { valid: true; input: ProductInput }
  | {
      valid: false
      errors: ProductFormErrors
      deliveryError: string | undefined
      firstInvalid: ProductFormField
    }

const DELIVERY_ERROR = 'Choose at least one delivery method.'

const FIELD_ORDER = ['name', 'price', 'stock', 'supplierId', 'categoryId'] as const
const MAX_PRICE = 99999
const MIN_PRICE = 0.01
const MAX_STOCK = 99999

export const toFormValues = (product: Product): ProductFormValues => ({
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  supplierId: product.supplierId,
  categoryId: product.categoryId,
  deliveryIds: product.deliveryIds,
  specs: product.specs.map(([label, value]) => ({ label, value })),
})

function validatePrice(text: string): string | undefined {
  if (text === '') return 'Enter a price.'
  const price = Number(text)
  if (price < MIN_PRICE) return `Enter ${MIN_PRICE} or more.`
  if (price > MAX_PRICE) return `Enter ${MAX_PRICE} or less.`
  return undefined
}

function validateStock(text: string): string | undefined {
  if (text === '') return 'Enter the units in stock.'
  if (!Number.isInteger(Number(text))) return 'Enter a whole number.'
  if (Number(text) > MAX_STOCK) return `Enter ${MAX_STOCK} or less.`
  return undefined
}

function readSpecs(form: HTMLFormElement): ProductSpec[] {
  return [...form.querySelectorAll('[data-slot=spec-row]')]
    .map((row) => [...row.querySelectorAll('input')].map((input) => input.value.trim()))
    .filter((cells): cells is [string, string] => cells[0] !== '' && cells[1] !== '')
    .map(([label, value]): ProductSpec => [label, value])
}

export function readProductForm(form: HTMLFormElement): ProductFormResult {
  const data = new FormData(form)
  const text = (field: string) => String(data.get(field) ?? '').trim()

  const name = text('name')
  const priceText = text('price')
  const stockText = text('stock')
  const supplierId = text('supplierId')
  const categoryId = text('categoryId')
  const deliveryIds = data.getAll('deliveryIds').map(String)

  const errors: ProductFormErrors = {}
  if (name === '') errors.name = 'Enter a product name.'
  const priceError = validatePrice(priceText)
  if (priceError) errors.price = priceError
  const stockError = validateStock(stockText)
  if (stockError) errors.stock = stockError
  if (supplierId === '') errors.supplierId = 'Choose a supplier.'
  if (categoryId === '') errors.categoryId = 'Choose a category.'

  const deliveryError = deliveryIds.length > 0 ? undefined : DELIVERY_ERROR
  const firstInvalid = FIELD_ORDER.find((field) => errors[field] !== undefined)

  if (firstInvalid !== undefined || deliveryError !== undefined) {
    return { valid: false, errors, deliveryError, firstInvalid: firstInvalid ?? 'deliveryIds' }
  }

  return {
    valid: true,
    input: {
      name,
      description: text('description'),
      specs: readSpecs(form),
      price: Number(priceText),
      stock: Number(stockText),
      supplierId,
      categoryId,
      deliveryIds,
    },
  }
}
