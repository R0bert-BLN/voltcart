<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;

function dashboardAdminToken(): string
{
    $user = User::factory()->create(['role' => UserRole::Admin]);

    return $user->createToken('auth')->plainTextToken;
}

function seedDashboardProducts(): void
{
    Category::factory()->create(['id' => 'laptops', 'name' => 'Laptops']);
    Category::factory()->create(['id' => 'audio', 'name' => 'Audio']);

    Supplier::factory()->create(['id' => 'northlane', 'name' => 'Northlane']);

    Product::factory()->create([
        'id' => 'lp-aster-14', 'name' => 'Aster Air 14',
        'category_id' => 'laptops', 'supplier_id' => 'northlane', 'price_cents' => 114900, 'stock' => 18,
    ]);
    Product::factory()->create([
        'id' => 'lp-aster-16', 'name' => 'Aster Pro 16',
        'category_id' => 'laptops', 'supplier_id' => 'northlane', 'price_cents' => 189900, 'stock' => 0,
    ]);
    Product::factory()->create([
        'id' => 'au-halden-nc', 'name' => 'Halden NC Headphones',
        'category_id' => 'audio', 'supplier_id' => 'northlane', 'price_cents' => 27900, 'stock' => 2,
    ]);
    Product::factory()->create([
        'id' => 'au-volt-buds', 'name' => 'Volt Buds',
        'category_id' => 'audio', 'supplier_id' => 'northlane', 'price_cents' => 8900, 'stock' => 5,
    ]);
}

it('returns the dashboard counts and the low-stock list for an admin', function () {
    seedDashboardProducts();

    $response = $this->withToken(dashboardAdminToken())
        ->getJson('/api/admin/dashboard')
        ->assertOk()
        ->assertJsonPath('products', 4)
        ->assertJsonPath('categories', 2)
        ->assertJsonPath('lowStock', 2)
        ->assertJsonPath('outOfStock', 1);

    // Ordered by stock, most urgent first.
    expect($response->json('lowStockProducts.*.id'))->toBe(['au-halden-nc', 'au-volt-buds']);
    expect($response->json('lowStockProducts.0'))->toHaveKeys(['id', 'name', 'categoryId', 'priceCents', 'stock', 'image']);
});

it('returns a zero dashboard when there is nothing in the catalogue', function () {
    $this->withToken(dashboardAdminToken())
        ->getJson('/api/admin/dashboard')
        ->assertOk()
        ->assertJsonPath('products', 0)
        ->assertJsonPath('categories', 0)
        ->assertJsonPath('lowStock', 0)
        ->assertJsonPath('outOfStock', 0)
        ->assertJsonCount(0, 'lowStockProducts');
});

it('blocks guests and clients from the dashboard route', function () {
    seedDashboardProducts();

    $this->getJson('/api/admin/dashboard')->assertStatus(401);

    $client = User::factory()->create(['role' => UserRole::Client]);
    $this->withToken($client->createToken('auth')->plainTextToken)
        ->getJson('/api/admin/dashboard')
        ->assertStatus(403);
});
