<?php

namespace App\Services;

use App\Data\Catalogue\CategoryData;
use App\Data\Catalogue\DeliveryMethodData;
use App\Data\Catalogue\ProductData;
use App\Data\Catalogue\ProductSummaryData;
use App\Data\Catalogue\SupplierData;
use App\Models\Category;
use App\Models\DeliveryMethod;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Supplier;

class CatalogueService
{
    private const PER_PAGE = 12;

    /** @return list<CategoryData> */
    public function categories(): array
    {
        $counts = Product::query()
            ->selectRaw('category_id, COUNT(*) as products_count')
            ->groupBy('category_id')
            ->pluck('products_count', 'category_id');

        return Category::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category): CategoryData => new CategoryData(
                id: $category->id,
                name: $category->name,
                icon: $category->icon,
                productsCount: (int) ($counts[$category->id] ?? 0),
            ))
            ->all();
    }

    /**
     * @param  array{category?: string, search?: string, supplier?: string, delivery_method?: string, price_min?: int, price_max?: int, in_stock?: bool, sort?: string, page?: int}  $filters
     * @return array{data: list<ProductSummaryData>, meta: array{page: int, last_page: int, total: int}}
     */
    public function products(array $filters): array
    {
        $query = Product::query();

        if (isset($filters['category'])) {
            $query->where('category_id', $filters['category']);
        }

        if (isset($filters['supplier'])) {
            $query->where('supplier_id', $filters['supplier']);
        }

        if (isset($filters['search'])) {
            $escaped = str_replace('%', '\%', addcslashes($filters['search'], '\_'));
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$escaped}%")
                ->orWhere('description', 'ilike', "%{$escaped}%"));
        }

        if (isset($filters['delivery_method'])) {
            $query->whereHas('deliveryMethods', fn ($q) => $q
                ->where('delivery_method_product.delivery_method_id', $filters['delivery_method']));
        }

        if (isset($filters['price_min'])) {
            $query->where('price_cents', '>=', $filters['price_min']);
        }

        if (isset($filters['price_max'])) {
            $query->where('price_cents', '<=', $filters['price_max']);
        }

        if (filter_var($filters['in_stock'] ?? null, FILTER_VALIDATE_BOOL)) {
            $query->where('stock', '>', 0);
        }

        match ($filters['sort'] ?? 'popular') {
            'price_asc' => $query->orderBy('price_cents')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price_cents')->orderBy('id'),
            'newest' => $query->orderByDesc('created_at')->orderBy('id'),
            // Popularity is the quantity sold, then the newest products win ties.
            default => $query->orderByDesc(
                OrderItem::query()
                    ->selectRaw('COALESCE(SUM(quantity), 0)')
                    ->whereColumn('order_items.product_id', 'products.id'),
            )->orderByDesc('created_at')->orderBy('id'),
        };

        $paginator = $query->paginate(
            perPage: self::PER_PAGE,
            page: $filters['page'] ?? 1,
        );

        return [
            'data' => ProductSummaryData::collect($paginator->items()),
            'meta' => [
                'page' => $paginator->currentPage(),
                'last_page' => max($paginator->lastPage(), 1),
                'total' => $paginator->total(),
            ],
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
}
