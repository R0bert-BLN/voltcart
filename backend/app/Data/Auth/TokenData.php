<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TokenData extends Data
{
    public function __construct(
        public string $token,
        public UserData $user,
    ) {}
}
