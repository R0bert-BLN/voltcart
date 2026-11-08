<?php

namespace App\Data\Catalogue;

use Spatie\LaravelData\Data;

class ProductFilterData extends Data
{
    public function __construct(
        public ?string $search,
        public ?string $category,
        public ?string $supplier,
        public ?string $deliveryMethod,
        public ?int $priceMin,
        public ?int $priceMax,
        public ?bool $inStock,
        public ?string $sort,
        public ?int $page,
    ) {}
}
