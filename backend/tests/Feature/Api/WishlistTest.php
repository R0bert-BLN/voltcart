<?php

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;

it('lists only the wishlist items of the authenticated client', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $other = User::factory()->create(['role' => UserRole::Client]);
    $mine = Product::factory()->create();
    $theirs = Product::factory()->create();

    WishlistItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $mine->id,
    ]);
    WishlistItem::factory()->create([
        'user_id' => $other->id,
        'product_id' => $theirs->id,
    ]);

    $this->actingAs($client, 'sanctum')
        ->getJson('/api/wishlist')
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.productId', $mine->id);
});

it('rejects guests from the wishlist', function () {
    $this->getJson('/api/wishlist')->assertStatus(401);
});

it('adds a product to the wishlist idempotently', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $product = Product::factory()->create();

    $this->actingAs($client, 'sanctum')
        ->putJson("/api/wishlist/{$product->id}")
        ->assertCreated()
        ->assertJsonPath('productId', $product->id);

    $this->actingAs($client, 'sanctum')
        ->putJson("/api/wishlist/{$product->id}")
        ->assertOk();

    expect(WishlistItem::query()->where('user_id', $client->id)->count())->toBe(1);
});

it('returns 404 when adding a missing product to the wishlist', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);

    $this->actingAs($client, 'sanctum')
        ->putJson('/api/wishlist/does-not-exist')
        ->assertStatus(404);
});

it('removes a product from the wishlist', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $product = Product::factory()->create();
    WishlistItem::factory()->create([
        'user_id' => $client->id,
        'product_id' => $product->id,
    ]);

    $this->actingAs($client, 'sanctum')
        ->deleteJson("/api/wishlist/{$product->id}")
        ->assertNoContent();

    expect(WishlistItem::query()->where('user_id', $client->id)->count())->toBe(0);
});
