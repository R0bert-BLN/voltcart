<?php

namespace App\Data\Common;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class DeliveryMethodData extends Data
{
    public function __construct(
        public string $id,
        public string $name,
        public int $priceCents,
        public int $days,
    ) {}
}
