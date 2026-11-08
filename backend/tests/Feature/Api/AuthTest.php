<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('registers a user and returns a token with the user', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Robert Volt',
        'email' => 'robert@example.com',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'terms' => true,
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
        ->assertJsonPath('user.email', 'robert@example.com')
        ->assertJsonPath('user.role', 'client');

    $user = User::whereEmail('robert@example.com')->firstOrFail();

    $this->assertDatabaseHas('users', ['email' => 'robert@example.com']);
    expect(Hash::check('secret123', $user->password))->toBeTrue();

    $this->withToken($response->json('token'))
        ->getJson('/api/me')
        ->assertOk()
        ->assertJsonPath('email', 'robert@example.com');
});

it('rejects registration when validation fails', function (callable $payload, array $expectedErrors) {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/register', array_filter($payload(), fn ($value) => $value !== null))
        ->assertStatus(422)
        ->assertJsonValidationErrors($expectedErrors);

    $this->assertDatabaseMissing('users', ['email' => 'new@example.com']);
})->with([
    'duplicate email' => [
        fn () => ['name' => 'R', 'email' => 'taken@example.com', 'password' => 'secret123', 'password_confirmation' => 'secret123', 'terms' => true],
        ['email'],
    ],
    'terms not accepted' => [
        fn () => ['name' => 'R', 'email' => 'new@example.com', 'password' => 'secret123', 'password_confirmation' => 'secret123', 'terms' => false],
        ['terms'],
    ],
    'too short password' => [
        fn () => ['name' => 'R', 'email' => 'new@example.com', 'password' => 'short', 'password_confirmation' => 'short', 'terms' => true],
        ['password'],
    ],
    'password not confirmed' => [
        fn () => ['name' => 'R', 'email' => 'new@example.com', 'password' => 'secret123', 'password_confirmation' => 'other123', 'terms' => true],
        ['password'],
    ],
    'missing required fields' => [
        fn () => [],
        ['name', 'email', 'password', 'terms'],
    ],
]);

it('logs in with valid credentials and returns a token with the user', function () {
    User::factory()->create(['email' => 'robert@example.com', 'password' => Hash::make('secret123')]);

    $this->postJson('/api/login', [
        'email' => 'robert@example.com',
        'password' => 'secret123',
    ])->assertCreated()
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
        ->assertJsonPath('user.email', 'robert@example.com');
});

it('rejects login with a wrong password', function () {
    User::factory()->create(['email' => 'robert@example.com']);

    $this->postJson('/api/login', [
        'email' => 'robert@example.com',
        'password' => 'wrong-password',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['email']);

    $this->postJson('/api/login', [
        'email' => 'nobody@example.com',
        'password' => 'whatever123',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('rejects login when validation fails', function () {
    $this->postJson('/api/login', ['email' => 'not-an-email'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'password']);
});

it('revokes the token on logout and requires an authenticated user', function () {
    $user = User::factory()->create();
    $token = $user->createToken('auth')->plainTextToken;

    $this->postJson('/api/logout')->assertStatus(401);

    $this->withToken($token)
        ->postJson('/api/logout')
        ->assertNoContent();

    expect($user->tokens()->count())->toBe(0);

    // The test harness caches the auth guard (and its resolved user) across
    // the requests of one test; drop it so the revoked token is re-checked.
    $this->app->forgetInstance('auth');

    $this->withToken($token)
        ->getJson('/api/me')
        ->assertStatus(401);
});

it('requires an authenticated user on me', function () {
    $this->getJson('/api/me')->assertStatus(401);
});
