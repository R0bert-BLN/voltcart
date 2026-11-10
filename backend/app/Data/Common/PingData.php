<?php

namespace App\Data\Common;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class PingData extends Data
{
    public function __construct(
        public bool $ok,
    ) {}
}
