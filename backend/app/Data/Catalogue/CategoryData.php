<?php

namespace App\Data\Catalogue;

use Spatie\LaravelData\Data;

class CategoryData extends Data
{
    public function __construct(
        public string $id,
        public string $name,
        public string $icon,
        public int $productsCount,
    ) {}
}
