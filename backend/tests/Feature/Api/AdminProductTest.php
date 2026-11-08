<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;

function adminToken(): string
{
    $user = User::factory()->create(['role' => UserRole::Admin]);

    return $user->createToken('auth')->plainTextToken;
}

function seedAdminProducts(): void
{
    $laptops = Category::factory()->create(['id' => 'laptops', 'name' => 'Laptops']);
    $audio = Category::factory()->create(['id' => 'audio', 'name' => 'Audio']);

    $northlane = Supplier::factory()->create(['id' => 'northlane', 'name' => 'Northlane']);
    $kestrel = Supplier::factory()->create(['id' => 'kestrel', 'name' => 'Kestrel']);

    Product::factory()->create([
        'id' => 'lp-aster-14', 'name' => 'Aster Air 14', 'category_id' => $laptops->id,
        'supplier_id' => $northlane->id, 'price_cents' => 114900, 'stock' => 18,
    ]);
    Product::factory()->create([
        'id' => 'lp-aster-16', 'name' => 'Aster Pro 16', 'category_id' => $laptops->id,
        'supplier_id' => $kestrel->id, 'price_cents' => 189900, 'stock' => 0,
    ]);
    Product::factory()->create([
        'id' => 'au-halden-nc', 'name' => 'Halden NC Headphones', 'category_id' => $audio->id,
        'supplier_id' => $northlane->id, 'price_cents' => 27900, 'stock' => 32,
    ]);
}

function validProductPayload(array $overrides = []): array
{
    return [
        'name' => 'Corvo 7 Phone',
        'categoryId' => Category::query()->firstOrCreate(['id' => 'phones'], ['name' => 'Phones', 'icon' => 'smartphone'])->id,
        'supplierId' => Supplier::query()->firstOrCreate(['id' => 'northlane'], ['name' => 'Northlane', 'country' => 'Netherlands'])->id,
        'priceCents' => 64900,
        'stock' => 40,
        'description' => 'A mid-range phone with a big battery.',
        'image' => 'products/corvo-7.jpg',
        'specs' => [
            ['label' => 'Warranty', 'value' => '24 months'],
        ],
        ...$overrides,
    ];
}

it('lists products for an admin with filters', function () {
    seedAdminProducts();
    $token = adminToken();

    $all = $this->withToken($token)
        ->getJson('/api/admin/products')
        ->assertOk()
        ->assertJsonCount(3, 'data');

    expect($all->json('meta.total'))->toBe(3);

    expect($this->withToken($token)->getJson('/api/admin/products?search=halden')
        ->assertOk()->json('data.*.id'))->toBe(['au-halden-nc']);

    expect($this->withToken($token)->getJson('/api/admin/products?category=audio')
        ->assertOk()->json('data.*.id'))->toBe(['au-halden-nc']);

    expect($this->withToken($token)->getJson('/api/admin/products?in_stock=1')
        ->assertOk()->json('data.*.id'))->toBe(['lp-aster-14', 'au-halden-nc']);
});

it('rejects unverifiable admin list queries', function (string $query, array $keys) {
    seedAdminProducts();

    $this->withToken(adminToken())
        ->getJson('/api/admin/products'.$query)
        ->assertStatus(422)
        ->assertJsonValidationErrors($keys);
})->with([
    'unknown category' => ['?category=nope', ['category']],
    'bad stock flag' => ['?in_stock=maybe', ['in_stock']],
    'bad page' => ['?page=0', ['page']],
]);

it('stores a product with an id generated from the name', function () {
    $payload = validProductPayload();

    $response = $this->withToken(adminToken())
        ->postJson('/api/admin/products', $payload)
        ->assertCreated()
        ->assertJsonPath('id', 'corvo-7-phone')
        ->assertJsonPath('name', 'Corvo 7 Phone')
        ->assertJsonPath('priceCents', 64900)
        ->assertJsonPath('categoryId', 'phones')
        ->assertJsonPath('categoryName', 'Phones');

    $this->assertDatabaseHas('products', [
        'id' => 'corvo-7-phone',
        'name' => 'Corvo 7 Phone',
        'category_id' => $payload['categoryId'],
        'price_cents' => 64900,
        'stock' => 40,
    ]);
});

it('suffixes the slug id when the name collides with an existing product', function () {
    $token = adminToken();

    $this->withToken($token)
        ->postJson('/api/admin/products', validProductPayload())
        ->assertCreated()
        ->assertJsonPath('id', 'corvo-7-phone');

    $this->withToken($token)
        ->postJson('/api/admin/products', validProductPayload())
        ->assertCreated()
        ->assertJsonPath('id', 'corvo-7-phone-2');
});

it('shows a product for an admin', function () {
    seedAdminProducts();

    $this->withToken(adminToken())
        ->getJson('/api/admin/products/lp-aster-14')
        ->assertOk()
        ->assertJsonPath('id', 'lp-aster-14')
        ->assertJsonPath('categoryName', 'Laptops')
        ->assertJsonPath('stockStatus', 'in_stock');
});

it('returns 404 for a missing product', function () {
    $this->withToken(adminToken())
        ->getJson('/api/admin/products/does-not-exist')
        ->assertNotFound();
});

it('updates a product and keeps its id', function () {
    seedAdminProducts();

    $payload = validProductPayload([
        'name' => 'Aster Air 14 — renewed',
        'priceCents' => 99900,
        'stock' => 5,
    ]);

    $this->withToken(adminToken())
        ->putJson('/api/admin/products/lp-aster-14', $payload)
        ->assertOk()
        ->assertJsonPath('id', 'lp-aster-14')
        ->assertJsonPath('name', 'Aster Air 14 — renewed')
        ->assertJsonPath('priceCents', 99900)
        ->assertJsonPath('stockStatus', 'low_stock');

    $this->assertDatabaseHas('products', [
        'id' => 'lp-aster-14',
        'name' => 'Aster Air 14 — renewed',
        'price_cents' => 99900,
        'stock' => 5,
    ]);
});

it('deletes a product', function () {
    seedAdminProducts();

    $this->withToken(adminToken())
        ->deleteJson('/api/admin/products/au-halden-nc')
        ->assertNoContent();

    $this->assertDatabaseMissing('products', ['id' => 'au-halden-nc']);

    $this->withToken(adminToken())
        ->getJson('/api/admin/products/au-halden-nc')
        ->assertNotFound();
});

it('rejects product payloads that fail validation', function (callable $payload, array $expectedErrors) {
    $this->withToken(adminToken())
        ->postJson('/api/admin/products', $payload())
        ->assertStatus(422)
        ->assertJsonValidationErrors($expectedErrors);
})->with([
    'missing required fields' => [
        fn () => [],
        ['name', 'categoryId', 'supplierId', 'priceCents', 'stock', 'description', 'image'],
    ],
    'unknown category' => [
        fn () => validProductPayload(['categoryId' => 'nope']),
        ['categoryId'],
    ],
    'unknown supplier' => [
        fn () => validProductPayload(['supplierId' => 'nope']),
        ['supplierId'],
    ],
    'non positive price' => [
        fn () => validProductPayload(['priceCents' => 0]),
        ['priceCents'],
    ],
    'negative stock' => [
        fn () => validProductPayload(['stock' => -1]),
        ['stock'],
    ],
    'bad specs entry' => [
        fn () => validProductPayload(['specs' => [['value' => 'no label']]]),
        ['specs.0.label'],
    ],
]);

it('blocks guests from the admin product routes', function (string $method, string $uri) {
    $this->json($method, $uri)->assertStatus(401);
})->with([
    ['GET', '/api/admin/products'],
    ['POST', '/api/admin/products'],
    ['GET', '/api/admin/products/lp-aster-14'],
    ['PUT', '/api/admin/products/lp-aster-14'],
    ['DELETE', '/api/admin/products/lp-aster-14'],
]);

it('blocks clients from the admin product routes', function () {
    seedAdminProducts();

    $token = User::factory()->create(['role' => UserRole::Client])
        ->createToken('auth')->plainTextToken;

    $this->withToken($token)->getJson('/api/admin/products')->assertStatus(403);
    $this->withToken($token)->getJson('/api/admin/products/lp-aster-14')->assertStatus(403);
});
