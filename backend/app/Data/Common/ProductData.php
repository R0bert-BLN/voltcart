<?php

namespace App\Data\Common;

use App\Enums\StockStatus;
use App\Models\Product;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ProductData extends Data
{
    public function __construct(
        public string $id,
        public string $name,
        public string $description,
        public int $priceCents,
        public int $stock,
        public string $image,
        public StockStatus $stockStatus,
        /** @var array<int, array{label: string, value: string}> */
        public array $specs = [],
        public ?SupplierData $supplier = null,
        /** @var list<DeliveryMethodData> */
        public array $deliveryMethods = [],
        public ?string $categoryId = null,
        public ?string $categoryName = null,
    ) {}

    public static function fromModel(Product $product): self
    {
        $product->loadMissing(['category', 'supplier', 'deliveryMethods']);

        return new self(
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
