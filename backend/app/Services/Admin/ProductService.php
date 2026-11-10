<?php

namespace App\Services\Admin;

use App\Data\Admin\StoreProductData;
use App\Data\Catalogue\ProductSummaryData;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductService
{
    private const PER_PAGE = 50;

    /**
     * @param  array{search?: string, category?: string, in_stock?: bool, page?: int}  $filters
     * @return array{data: list<ProductSummaryData>, meta: array{page: int, last_page: int, total: int}}
     */
    public function paginate(array $filters): array
    {
        $query = Product::query();

        if (isset($filters['category'])) {
            $query->where('category_id', $filters['category']);
        }

        if (isset($filters['search'])) {
            $escaped = str_replace('%', '\%', addcslashes($filters['search'], '\_'));
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$escaped}%")
                ->orWhere('description', 'ilike', "%{$escaped}%"));
        }

        if (filter_var($filters['in_stock'] ?? null, FILTER_VALIDATE_BOOL)) {
            $query->where('stock', '>', 0);
        }

        $paginator = $query->orderBy('name')->orderBy('id')->paginate(
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

    public function create(StoreProductData $data): Product
    {
        /** @var Product $product */
        $product = Product::create([
            ...$this->attributes($data),
            'id' => $this->uniqueSlug($data->name),
        ]);

        return $product;
    }

    public function update(Product $product, StoreProductData $data): Product
    {
        $product->update($this->attributes($data));

        return $product->refresh();
    }

    public function delete(Product $product): void
    {
        $product->delete();
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
}
