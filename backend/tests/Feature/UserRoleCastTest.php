<?php

use App\Enums\UserRole;
use App\Models\User;

it('casts the role attribute to the UserRole enum', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    expect($user->role)->toBe(UserRole::Admin)
        ->and($user->fresh()->role)->toBe(UserRole::Admin);
});

it('falls back to the client role', function () {
    $user = User::factory()->create();

    expect($user->fresh()->role)->toBe(UserRole::Client);
});
