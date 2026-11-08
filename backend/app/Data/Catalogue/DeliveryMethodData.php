<?php

namespace App\Data\Catalogue;

use Spatie\LaravelData\Data;

class DeliveryMethodData extends Data
{
    public function __construct(
        public string $id,
        public string $name,
        public int $priceCents,
        public int $days,
    ) {}
}
