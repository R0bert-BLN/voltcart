<?php

namespace App\Data\Order;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class OrderItemData extends Data
{
    public function __construct(
        public string $productId,
        public string $name,
        public int $unitPriceCents,
        public int $quantity,
        public int $lineTotalCents,
    ) {}
}
