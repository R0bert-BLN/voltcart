<?php

namespace App\Data\Catalogue;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ProductSummaryData extends Data
{
    public function __construct(
        public string $id,
        public string $name,
        public string $categoryId,
        public int $priceCents,
        public int $stock,
        public string $image,
    ) {}
}
