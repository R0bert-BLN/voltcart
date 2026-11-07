<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/** Example DTO; shows the pattern every endpoint follows. */
class PingData extends Data
{
    public function __construct(
        public bool $ok,
    ) {}
}
