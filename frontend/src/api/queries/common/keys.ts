export const queryKeys = {
  me: ['me'] as const,
  cart: ['cart'] as const,
  wishlist: ['wishlist'] as const,
  orders: ['orders'] as const,
  orderList: ['orders', 'list'] as const,
  order: (id: string | undefined) => ['orders', id ?? null] as const,
}
