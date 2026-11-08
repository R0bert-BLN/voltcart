<?php

namespace App\Data\Cart;

use Spatie\LaravelData\Data;

class CartLineData extends Data
{
    public function __construct(
        public string $productId,
        public string $name,
        public int $priceCents,
        public int $quantity,
        public int $lineTotalCents,
        public string $image,
    ) {}
}
