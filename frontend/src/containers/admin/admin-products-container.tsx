import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { deleteProduct, useAdminProducts } from '@/api/queries/admin/catalogue'
import { useCategories } from '@/api/queries/common/catalogue'
import { AdminProductsView } from '@/containers/admin/admin-products-view'
import {
  STOCK_OPTIONS,
  type AdminProductsSearch,
} from '@/containers/admin/admin-products-search'
import { focusAfterPaint } from '@/lib/focus'
import { showToast } from '@/lib/toasts'

const route = getRouteApi('/admin/products/')

const PAGE_SIZE = 10

export function AdminProductsContainer() {
  const navigate = useNavigate()
  const search = route.useSearch()
  const categories = useCategories()
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null)

  const found = useAdminProducts(search)
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE))
  const savedIndex = search.saved
    ? found.findIndex(({ product }) => product.id === search.saved)
    : -1
  const requestedPage = savedIndex >= 0 ? Math.floor(savedIndex / PAGE_SIZE) + 1 : (search.page ?? 1)
  const page = Math.max(1, Math.min(requestedPage, pages))
  const rows = found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const productToDelete = found.find(({ product }) => product.id === productToDeleteId)?.product

  const patchSearch = (patch: Partial<AdminProductsSearch>) =>
    void navigate({ to: '/admin/products', search: { ...search, ...patch }, replace: true })

  const confirmDelete = () => {
    if (!productToDelete) return
    deleteProduct(productToDelete.id)
    setProductToDeleteId(null)
    showToast(`${productToDelete.name} deleted.`)
    focusAfterPaint('[data-add-product]')
  }

  return (
    <AdminProductsView
      rows={rows}
      totalCount={found.length}
      query={search.q ?? ''}
      category={search.category ?? ''}
      stock={search.stock ?? ''}
      categoryOptions={[
        { value: '', label: 'All categories' },
        ...categories.map((category) => ({ value: category.id, label: category.name })),
      ]}
      stockOptions={STOCK_OPTIONS}
      savedId={search.saved}
      page={page}
      pages={pages}
      productToDelete={productToDelete}
      onQueryChange={(query) => patchSearch({ q: query || undefined, page: undefined })}
      onCategoryChange={(category) => patchSearch({ category: category || undefined, page: undefined })}
      onStockChange={(stock) => patchSearch({ stock: stock || undefined, page: undefined })}
      onClearFilters={() => void navigate({ to: '/admin/products', search: {}, replace: true })}
      onPageChange={(next) => patchSearch({ page: next === 1 ? undefined : next })}
      onDeleteRequest={setProductToDeleteId}
      onDeleteCancel={() => setProductToDeleteId(null)}
      onDeleteConfirm={confirmDelete}
    />
  )
}
