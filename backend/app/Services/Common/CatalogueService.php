<?php

namespace App\Services\Common;

use App\Data\Common\CategoryData;
use App\Data\Common\DeliveryMethodData;
use App\Data\Common\ProductData;
use App\Data\Common\ProductSummaryData;
use App\Data\Common\SupplierData;
use App\Models\Category;
use App\Models\DeliveryMethod;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Supplier;
use App\Support\PaginationMeta;
use Illuminate\Database\Eloquent\Builder;

class CatalogueService
{
    private const PER_PAGE = 12;

    /** @return list<CategoryData> */
    public function categories(): array
    {
        return Category::query()->withCount('products')->orderBy('name')->get()
            ->map(fn (Category $category): CategoryData => new CategoryData(
                id: $category->id,
                name: $category->name,
                icon: $category->icon,
                productsCount: (int) $category->products_count,
            ))
            ->values()
            ->all();
    }

    /**
     * @param  array{category?: string, search?: string, supplier?: string, delivery_method?: string, price_min?: int, price_max?: int, in_stock?: bool, sort?: string}  $filters
     * @return array{data: list<ProductSummaryData>, meta: array{page: int, last_page: int, total: int}}
     */
    public function products(array $filters, int $page): array
    {
        $query = Product::query()->matching($filters);

        if (isset($filters['supplier'])) {
            $query->where('supplier_id', $filters['supplier']);
        }

        if (isset($filters['delivery_method'])) {
            $query->whereHas('deliveryMethods', fn (Builder $q) => $q
                ->where('delivery_method_product.delivery_method_id', $filters['delivery_method']));
        }

        if (isset($filters['price_min'])) {
            $query->where('price_cents', '>=', $filters['price_min']);
        }

        if (isset($filters['price_max'])) {
            $query->where('price_cents', '<=', $filters['price_max']);
        }

        $this->applySort($query, $filters['sort'] ?? 'popular');

        $paginator = $query->paginate(perPage: self::PER_PAGE, page: $page);

        return [
            'data' => ProductSummaryData::collect($paginator->items()),
            'meta' => PaginationMeta::from($paginator),
        ];
    }

    public function product(Product $product): ProductData
    {
        return ProductData::fromModel($product);
    }

    /** @return list<SupplierData> */
    public function suppliers(): array
    {
        return SupplierData::collect(Supplier::query()->orderBy('name')->get())->values()->all();
    }

    /** @return list<DeliveryMethodData> */
    public function deliveryMethods(): array
    {
        return DeliveryMethodData::collect(DeliveryMethod::query()->orderBy('name')->get())->values()->all();
    }

    /** @param  Builder<Product>  $query */
    private function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'price_asc' => $query->orderBy('price_cents')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price_cents')->orderBy('id'),
            'newest' => $query->orderByDesc('created_at')->orderBy('id'),
            default => $query->orderByDesc(
                OrderItem::query()
                    ->selectRaw('COALESCE(SUM(quantity), 0)')
                    ->whereColumn('order_items.product_id', 'products.id'),
            )->orderByDesc('created_at')->orderBy('id'),
        };
    }
}
