<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

/** Example DTO; shows the pattern every endpoint follows. */
#[TypeScript]
class PingData extends Data
{
    public function __construct(
        public bool $ok,
    ) {}
}
