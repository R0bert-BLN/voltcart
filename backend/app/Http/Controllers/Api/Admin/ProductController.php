<?php

namespace App\Http\Controllers\Api\Admin;

use App\Data\Admin\StoreProductData;
use App\Data\Catalogue\DeliveryMethodData;
use App\Data\Catalogue\ProductData;
use App\Data\Catalogue\ProductSummaryData;
use App\Data\Catalogue\SupplierData;
use App\Enums\StockStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    private const PER_PAGE = 50;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'exists:categories,id'],
            'in_stock' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Product::query();

        if (isset($validated['category'])) {
            $query->where('category_id', $validated['category']);
        }

        if (isset($validated['search'])) {
            $escaped = str_replace('%', '\%', addcslashes($validated['search'], '\_'));
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$escaped}%")
                ->orWhere('description', 'ilike', "%{$escaped}%"));
        }

        if (filter_var($validated['in_stock'] ?? null, FILTER_VALIDATE_BOOL)) {
            $query->where('stock', '>', 0);
        }

        $paginator = $query->orderBy('name')->orderBy('id')->paginate(
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

    public function store(StoreProductData $data): JsonResponse
    {
        $product = Product::create([
            ...$this->attributes($data),
            'id' => $this->uniqueSlug($data->name),
        ]);

        return response()->json($this->toData($product), 201);
    }

    public function show(Product $product): ProductData
    {
        return $this->toData($product);
    }

    public function update(Product $product, StoreProductData $data): ProductData
    {
        $product->update($this->attributes($data));

        return $this->toData($product);
    }

    public function destroy(Product $product): Response
    {
        $product->delete();

        return response()->noContent();
    }

    /** @return array<string, mixed> model fillable attributes */
    private function attributes(StoreProductData $data): array
    {
        return [
            'name' => $data->name,
            'category_id' => $data->categoryId,
            'supplier_id' => $data->supplierId,
            'price_cents' => $data->priceCents,
            'stock' => $data->stock,
            'description' => $data->description,
            'image' => $data->image,
            'specs' => $data->specs,
        ];
    }

    // The id is the slug of the name; a collision gets a numeric suffix.
    private function uniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $candidate = $slug;

        for ($n = 2; Product::query()->whereKey($candidate)->exists(); $n++) {
            $candidate = "{$slug}-{$n}";
        }

        return $candidate;
    }

    private function toData(Product $product): ProductData
    {
        $product->load(['category', 'supplier', 'deliveryMethods']);

        return new ProductData(
            id: $product->id,
            name: $product->name,
            description: $product->description,
            priceCents: $product->price_cents,
            stock: $product->stock,
            stockStatus: StockStatus::fromStock($product->stock),
            image: $product->image,
            specs: $product->specs ?? [],
            supplier: $product->supplier !== null ? SupplierData::from($product->supplier) : null,
            deliveryMethods: DeliveryMethodData::collect($product->deliveryMethods)->values()->all(),
            categoryId: $product->category_id,
            categoryName: $product->category->name,
        );
    }
}
