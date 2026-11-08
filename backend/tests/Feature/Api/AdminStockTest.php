<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;

function stockAdminToken(): string
{
    $user = User::factory()->create(['role' => UserRole::Admin]);

    return $user->createToken('auth')->plainTextToken;
}

function seedStockProducts(): void
{
    Category::factory()->create(['id' => 'audio', 'name' => 'Audio']);
    Supplier::factory()->create(['id' => 'northlane', 'name' => 'Northlane']);

    Product::factory()->create([
        'id' => 'au-halden-nc', 'name' => 'Halden NC Headphones',
        'category_id' => 'audio', 'supplier_id' => 'northlane',
        'price_cents' => 27900, 'stock' => 12,
    ]);
}

it('updates the stock of a product', function () {
    seedStockProducts();

    $this->withToken(stockAdminToken())
        ->patchJson('/api/admin/products/au-halden-nc/stock', ['stock' => 4])
        ->assertOk()
        ->assertJsonPath('id', 'au-halden-nc')
        ->assertJsonPath('stock', 4)
        ->assertJsonPath('stockStatus', 'low_stock');

    $this->assertDatabaseHas('products', ['id' => 'au-halden-nc', 'stock' => 4]);
});

it('reports out of stock after the update', function () {
    seedStockProducts();

    $this->withToken(stockAdminToken())
        ->patchJson('/api/admin/products/au-halden-nc/stock', ['stock' => 0])
        ->assertOk()
        ->assertJsonPath('stockStatus', 'out_of_stock');
});

it('rejects invalid stock payloads', function (array $payload, array $keys) {
    seedStockProducts();

    $this->withToken(stockAdminToken())
        ->patchJson('/api/admin/products/au-halden-nc/stock', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors($keys);
})->with([
    'missing stock' => [[], ['stock']],
    'negative stock' => [['stock' => -1], ['stock']],
    'non integer stock' => [['stock' => 'many'], ['stock']],
]);

it('returns 404 when updating the stock of a missing product', function () {
    $this->withToken(stockAdminToken())
        ->patchJson('/api/admin/products/does-not-exist/stock', ['stock' => 3])
        ->assertNotFound();
});

it('blocks guests and clients from the stock route', function () {
    seedStockProducts();

    $this->patchJson('/api/admin/products/au-halden-nc/stock', ['stock' => 3])
        ->assertStatus(401);

    $client = User::factory()->create(['role' => UserRole::Client]);
    $this->withToken($client->createToken('auth')->plainTextToken)
        ->patchJson('/api/admin/products/au-halden-nc/stock', ['stock' => 3])
        ->assertStatus(403);
});
