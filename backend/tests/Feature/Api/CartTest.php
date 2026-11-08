<?php

use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;

it('returns an empty cart for a client', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);

    $this->actingAs($client, 'sanctum')
        ->getJson('/api/cart')
        ->assertOk()
        ->assertJsonPath('lines', [])
        ->assertJsonPath('subtotalCents', 0);
});

it('lists cart lines with an accurate subtotal', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $first = Product::factory()->create(['price_cents' => 1000, 'stock' => 10]);
    $second = Product::factory()->create(['price_cents' => 250, 'stock' => 10]);

    CartItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $first->id,
        'quantity' => 2,
    ]);
    CartItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $second->id,
        'quantity' => 3,
    ]);

    $this->actingAs($client, 'sanctum')
        ->getJson('/api/cart')
        ->assertOk()
        ->assertJsonCount(2, 'lines')
        ->assertJsonPath('subtotalCents', 2750)
        ->assertJsonFragment(['productId' => $first->id, 'lineTotalCents' => 2000])
        ->assertJsonFragment(['productId' => $second->id, 'lineTotalCents' => 750]);
});

it('rejects guests from the cart', function () {
    $this->getJson('/api/cart')->assertStatus(401);
});

it('sets the quantity for a product', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $product = Product::factory()->create(['price_cents' => 500, 'stock' => 10]);

    $this->actingAs($client, 'sanctum')
        ->putJson("/api/cart/{$product->id}", ['quantity' => 4])
        ->assertOk()
        ->assertJsonPath('lines.0.productId', $product->id)
        ->assertJsonPath('lines.0.quantity', 4)
        ->assertJsonPath('subtotalCents', 2000);

    expect(CartItem::query()->where('user_id', $client->id)->count())->toBe(1);
});

it('caps the quantity at the stock of the product', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $product = Product::factory()->create(['price_cents' => 500, 'stock' => 3]);

    $this->actingAs($client, 'sanctum')
        ->putJson("/api/cart/{$product->id}", ['quantity' => 10])
        ->assertOk()
        ->assertJsonPath('lines.0.quantity', 3);
});

it('drops the line when a product is out of stock', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $product = Product::factory()->create(['price_cents' => 500, 'stock' => 0]);
    CartItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->actingAs($client, 'sanctum')
        ->putJson("/api/cart/{$product->id}", ['quantity' => 2])
        ->assertOk()
        ->assertJsonCount(0, 'lines');

    expect(CartItem::query()->where('user_id', $client->id)->count())->toBe(0);
});

it('updates an existing line instead of duplicating it', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $product = Product::factory()->create(['price_cents' => 500, 'stock' => 10]);
    CartItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->actingAs($client, 'sanctum')
        ->putJson("/api/cart/{$product->id}", ['quantity' => 2])
        ->assertOk()
        ->assertJsonCount(1, 'lines');

    expect(CartItem::query()->where('user_id', $client->id)->count())->toBe(1)
        ->and(CartItem::query()->where('user_id', $client->id)->value('quantity'))->toBe(2);
});

it('rejects an invalid quantity', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $product = Product::factory()->create();

    $this->actingAs($client, 'sanctum')
        ->putJson("/api/cart/{$product->id}", ['quantity' => 0])
        ->assertStatus(422);

    $this->actingAs($client, 'sanctum')
        ->putJson("/api/cart/{$product->id}", ['quantity' => 'many'])
        ->assertStatus(422);
});

it('returns 404 when setting a quantity for a missing product', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);

    $this->actingAs($client, 'sanctum')
        ->putJson('/api/cart/does-not-exist', ['quantity' => 1])
        ->assertStatus(404);
});

it('removes a product from the cart', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $product = Product::factory()->create();
    CartItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $this->actingAs($client, 'sanctum')
        ->deleteJson("/api/cart/{$product->id}")
        ->assertNoContent();

    expect(CartItem::query()->where('user_id', $client->id)->count())->toBe(0);
});

it('removes only the line of the given product', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $first = Product::factory()->create();
    $second = Product::factory()->create();
    CartItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $first->id,
        'quantity' => 1,
    ]);
    CartItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $second->id,
        'quantity' => 1,
    ]);

    $this->actingAs($client, 'sanctum')
        ->deleteJson("/api/cart/{$first->id}")
        ->assertNoContent();

    expect(CartItem::query()->where('user_id', $client->id)->count())->toBe(1);
});

it('merges the guest cart after login', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $stored = Product::factory()->create(['price_cents' => 500, 'stock' => 10]);
    $guestNew = Product::factory()->create(['price_cents' => 300, 'stock' => 10]);
    $guestHigher = Product::factory()->create(['price_cents' => 200, 'stock' => 10]);

    CartItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $stored->id,
        'quantity' => 1,
    ]);

    $this->actingAs($client, 'sanctum')
        ->postJson('/api/cart/merge', [
            'items' => [
                ['productId' => $guestNew->id, 'quantity' => 2],
                ['productId' => $guestHigher->id, 'quantity' => 4],
                ['productId' => $stored->id, 'quantity' => 3],
            ],
        ])
        ->assertOk()
        ->assertJsonCount(3, 'lines')
        ->assertJsonPath('subtotalCents', 2900);

    $quantities = CartItem::query()->where('user_id', $client->id)
        ->pluck('quantity', 'product_id');

    expect($quantities)->toHaveCount(3)
        ->and($quantities[$stored->id])->toBe(3)
        ->and($quantities[$guestNew->id])->toBe(2)
        ->and($quantities[$guestHigher->id])->toBe(4);
});

it('caps merged quantities at the stock of the products', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $lowStock = Product::factory()->create(['price_cents' => 500, 'stock' => 2]);

    $this->actingAs($client, 'sanctum')
        ->postJson('/api/cart/merge', [
            'items' => [
                ['productId' => $lowStock->id, 'quantity' => 10],
            ],
        ])
        ->assertOk()
        ->assertJsonCount(1, 'lines')
        ->assertJsonPath('lines.0.quantity', 2);
});

it('accepts an empty guest cart on merge', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);

    $this->actingAs($client, 'sanctum')
        ->postJson('/api/cart/merge', ['items' => []])
        ->assertOk()
        ->assertJsonCount(0, 'lines');
});

it('rejects an invalid merge payload', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);

    $this->actingAs($client, 'sanctum')
        ->postJson('/api/cart/merge', [
            'items' => [
                ['productId' => 'nope', 'quantity' => 1],
            ],
        ])
        ->assertStatus(422);

    $this->actingAs($client, 'sanctum')
        ->postJson('/api/cart/merge', [
            'items' => [
                ['productId' => 'nope', 'quantity' => 0],
            ],
        ])
        ->assertStatus(422);
});
