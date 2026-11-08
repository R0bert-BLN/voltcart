<?php

namespace App\Data\Cart;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
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
