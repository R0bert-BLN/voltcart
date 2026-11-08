<?php

namespace App\Data\Catalogue;

use App\Enums\StockStatus;
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
}
