<?php

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum UserRole: string
{
    case Client = 'client';
    case Admin = 'admin';
}
