import {
  useCategories,
  useDeliveryMethods,
  usePopularProducts,
} from '@/api/queries/common/catalogue'
import { StoreHomeView } from '@/components/views/client/store-home-view'
import { useShoppingActions } from '@/containers/client/catalogue/use-shopping-actions'

const POPULAR_LIMIT = 8

export function StoreHomeContainer() {
  const categories = useCategories()
  const popular = usePopularProducts(POPULAR_LIMIT)
  const deliveryMethods = useDeliveryMethods()
  const { wishedIds, addToCart, toggleWish } = useShoppingActions()

  return (
    <StoreHomeView
      categories={categories}
      popular={popular}
      deliveryMethods={deliveryMethods}
      wishedIds={wishedIds}
      onAdd={(product) => void addToCart(product.id)}
      onWish={(product) => toggleWish(product.id)}
    />
  )
}
