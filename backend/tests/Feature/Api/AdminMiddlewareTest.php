<?php

use App\Enums\UserRole;
use App\Models\User;

it('returns 401 for a guest on admin routes', function () {
    $this->getJson('/api/admin/ping')->assertStatus(401);
});

it('returns 403 for a client on admin routes', function () {
    $user = User::factory()->create(['role' => UserRole::Client]);
    $token = $user->createToken('auth')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/ping')
        ->assertStatus(403);
});

it('returns 200 for an admin on admin routes', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);
    $token = $user->createToken('auth')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/ping')
        ->assertOk()
        ->assertJsonPath('ok', true);
});
