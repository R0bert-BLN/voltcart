export type CartData = {
lines: CartLineData[],
subtotalCents: number,
};
export type CartLineData = {
productId: string,
name: string,
priceCents: number,
quantity: number,
lineTotalCents: number,
image: string,
};
export type CartUpdateData = {
quantity: number,
};
export type CategoryData = {
id: string,
name: string,
icon: string,
productsCount: number,
};
export type CursorPaginatedDataCollection<TKey, TValue> = CursorPaginator<TKey, TValue>;
export type CursorPaginator<TKey, TValue> = {
data: TKey extends string ? Record<TKey, TValue> : TValue[],
links: {
url: string | null,
label: string,
active: boolean,
}[],
meta: {
path: string,
per_page: number,
next_cursor: string | null,
next_page_url: string | null,
prev_cursor: string | null,
prev_page_url: string | null,
},
};
export type CursorPaginatorInterface<TKey, TValue> = CursorPaginator<TKey, TValue>;
export type DashboardData = {
products: number,
categories: number,
lowStock: number,
outOfStock: number,
lowStockProducts: ProductSummaryData[],
};
export type DeliveryMethodData = {
id: string,
name: string,
priceCents: number,
days: number,
};
export type LengthAwarePaginator<TKey, TValue> = {
data: TKey extends string ? Record<TKey, TValue> : TValue[],
links: {
url: string | null,
label: string,
active: boolean,
}[],
meta: {
total: number,
current_page: number,
first_page_url: string,
from: number | null,
last_page: number,
last_page_url: string,
next_page_url: string | null,
path: string,
per_page: number,
prev_page_url: string | null,
to: number | null,
},
};
export type LengthAwarePaginatorInterface<TKey, TValue> = LengthAwarePaginator<TKey, TValue>;
export type LoginData = {
email: string,
password: string,
};
export type OrderData = {
id: string,
status: string,
paymentMethod: string,
subtotalCents: number,
deliveryCents: number,
totalCents: number,
estimatedAt: string | null,
items: OrderItemData[],
};
export type OrderItemData = {
productId: string,
name: string,
unitPriceCents: number,
quantity: number,
lineTotalCents: number,
};
export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderSummaryData = {
id: string,
status: string,
paymentMethod: string,
subtotalCents: number,
deliveryCents: number,
totalCents: number,
estimatedAt: string | null,
createdAt: string,
itemCount: number,
};
export type PaginatedDataCollection<TKey, TValue> = LengthAwarePaginator<TKey, TValue>;
export type PingData = {
ok: boolean,
};
export type PlaceOrderData = {
deliveryMethodId: string,
paymentMethod: string,
contactName: string,
contactPhone: string,
addressLine1: string,
postalCode: string,
city: string,
country: string,
};
export type ProductData = {
id: string,
name: string,
description: string,
priceCents: number,
stock: number,
image: string,
stockStatus: StockStatus,
specs: {
label: string,
value: string,
}[],
supplier: SupplierData | null,
deliveryMethods: DeliveryMethodData[],
categoryId: string | null,
categoryName: string | null,
};
export type ProductFilterData = {
search: string | null,
category: string | null,
supplier: string | null,
deliveryMethod: string | null,
priceMin: number | null,
priceMax: number | null,
inStock: boolean | null,
sort: string | null,
page: number | null,
};
export type ProductSummaryData = {
id: string,
name: string,
categoryId: string,
priceCents: number,
stock: number,
image: string,
};
export type RegisterData = {
name: string,
email: string,
password: string,
terms: boolean,
};
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type StockUpdateData = {
stock: number,
};
export type StoreProductData = {
name: string,
categoryId: string,
supplierId: string,
priceCents: number,
stock: number,
description: string,
image: string,
specs: {
label: string,
value: string,
}[],
};
export type SupplierData = {
id: string,
name: string,
country: string,
};
export type TokenData = {
token: string,
user: UserData,
};
export type UserData = {
id: number,
name: string,
email: string,
phone: string | null,
role: string,
};
export type UserRole = 'client' | 'admin';
export type WishlistItemData = {
productId: string,
name: string,
priceCents: number,
image: string,
addedAt: string,
};
