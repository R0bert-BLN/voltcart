<?php

namespace App\Data\Cart;

use Spatie\LaravelData\Data;

class CartData extends Data
{
    /**
     * @param  array<int, CartLineData>  $lines
     */
    public function __construct(
        public array $lines,
        public int $subtotalCents,
    ) {}
}
