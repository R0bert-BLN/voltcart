<?php

namespace App\Data\Auth;

use Spatie\LaravelData\Data;

class TokenData extends Data
{
    public function __construct(
        public string $token,
        public UserData $user,
    ) {}
}
