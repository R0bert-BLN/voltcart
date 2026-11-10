<?php

namespace App\Data\Common;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class SupplierData extends Data
{
    public function __construct(
        public string $id,
        public string $name,
        public string $country,
    ) {}
}
