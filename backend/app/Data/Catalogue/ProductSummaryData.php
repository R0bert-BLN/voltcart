<?php

namespace App\Data\Catalogue;

use Spatie\LaravelData\Data;

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
