<?php

namespace App\Data\Order;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class OrderData extends Data
{
    /**
     * @param  array<int, OrderItemData>  $items
     */
    public function __construct(
        public string $id,
        public string $status,
        public string $paymentMethod,
        public int $subtotalCents,
        public int $deliveryCents,
        public int $totalCents,
        public ?string $estimatedAt,
        public array $items,
    ) {}
}
