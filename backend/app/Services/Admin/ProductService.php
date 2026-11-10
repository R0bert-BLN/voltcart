<?php

namespace App\Services\Admin;

use App\Data\Admin\StoreProductData;
use App\Data\Common\ProductData;
use App\Data\Common\ProductSummaryData;
use App\Models\Product;
use App\Support\PaginationMeta;
use Illuminate\Support\Str;

class ProductService
{
    private const PER_PAGE = 50;

    /**
     * @param  array{category?: string, search?: string, in_stock?: bool}  $filters
     * @return array{data: list<ProductSummaryData>, meta: array{page: int, last_page: int, total: int}}
     */
    public function paginate(array $filters, int $page): array
    {
        $paginator = Product::query()
            ->matching($filters)
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(perPage: self::PER_PAGE, page: $page);

        return [
            'data' => ProductSummaryData::collect($paginator->items()),
            'meta' => PaginationMeta::from($paginator),
        ];
    }

    public function show(Product $product): ProductData
    {
        return ProductData::fromModel($product);
    }

    public function create(StoreProductData $data): ProductData
    {
        $product = Product::query()->create([
            ...$this->attributes($data),
            'id' => $this->uniqueSlug($data->name),
        ]);

        return ProductData::fromModel($product);
    }

    public function update(Product $product, StoreProductData $data): ProductData
    {
        $product->update($this->attributes($data));

        return ProductData::fromModel($product->refresh());
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    /** @return array<string, mixed> */
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
