<?php

namespace App\Http\Controllers\Api;

use App\Data\Catalogue\CategoryData;
use App\Data\Catalogue\ProductSummaryData;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogueController extends Controller
{
    private const PER_PAGE = 12;

    public function categories(): JsonResponse
    {
        $counts = Product::query()
            ->selectRaw('category_id, COUNT(*) as products_count')
            ->groupBy('category_id')
            ->pluck('products_count', 'category_id');

        $categories = Category::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => new CategoryData(
                id: $category->id,
                name: $category->name,
                icon: $category->icon,
                productsCount: (int) ($counts[$category->id] ?? 0),
            ));

        return response()->json($categories);
    }

    public function products(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'exists:categories,id'],
            'search' => ['nullable', 'string', 'max:120'],
            'supplier' => ['nullable', 'string', 'exists:suppliers,id'],
            'delivery_method' => ['nullable', 'string', 'exists:delivery_methods,id'],
            'price_min' => ['nullable', 'integer', 'min:0'],
            'price_max' => ['nullable', 'integer', 'min:0'],
            'in_stock' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'string', 'in:popular,price_asc,price_desc,newest'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Product::query();

        if (isset($validated['category'])) {
            $query->where('category_id', $validated['category']);
        }

        if (isset($validated['supplier'])) {
            $query->where('supplier_id', $validated['supplier']);
        }

        if (isset($validated['search'])) {
            $escaped = str_replace('%', '\%', addcslashes($validated['search'], '\_'));
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$escaped}%")
                ->orWhere('description', 'ilike', "%{$escaped}%"));
        }

        if (isset($validated['delivery_method'])) {
            $query->whereHas('deliveryMethods', fn ($q) => $q
                ->where('delivery_method_product.delivery_method_id', $validated['delivery_method']));
        }

        if (isset($validated['price_min'])) {
            $query->where('price_cents', '>=', $validated['price_min']);
        }

        if (isset($validated['price_max'])) {
            $query->where('price_cents', '<=', $validated['price_max']);
        }

        if (filter_var($validated['in_stock'] ?? null, FILTER_VALIDATE_BOOL)) {
            $query->where('stock', '>', 0);
        }

        match ($validated['sort'] ?? 'popular') {
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
            page: $validated['page'] ?? 1,
        );

        return response()->json([
            'data' => ProductSummaryData::collect($paginator->items()),
            'meta' => [
                'page' => $paginator->currentPage(),
                'last_page' => max($paginator->lastPage(), 1),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
