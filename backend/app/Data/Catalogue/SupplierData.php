<?php

namespace App\Data\Catalogue;

use Spatie\LaravelData\Data;

class SupplierData extends Data
{
    public function __construct(
        public string $id,
        public string $name,
        public string $country,
    ) {}
}
