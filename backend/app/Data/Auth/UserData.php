<?php

namespace App\Data\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public ?string $phone,
        public string $role,
    ) {}

    public static function fromModel(User $user): self
    {
        // The model's casts() docblock makes static analysis see `role` as a
        // plain string, so read the attribute untyped and handle both cases.
        $role = $user->getAttribute('role');

        return new self(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            phone: $user->phone,
            role: $role instanceof UserRole ? $role->value : (string) $role,
        );
    }
}
