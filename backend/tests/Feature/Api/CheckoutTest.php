<?php

use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\DeliveryMethod;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

function checkoutPayload(DeliveryMethod $delivery, array $overrides = []): array
{
    return array_merge([
        'deliveryMethodId' => $delivery->id,
        'paymentMethod' => 'card',
        'contactName' => 'Maya Dupont',
        'contactPhone' => '+33 6 12 34 56 78',
        'addressLine1' => '12 rue des Lilas',
        'postalCode' => '75011',
        'city' => 'Paris',
        'country' => 'France',
    ], $overrides);
}

it('places an order from the cart', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $delivery = DeliveryMethod::factory()->create(['price_cents' => 490, 'days' => 3]);
    $first = Product::factory()->create(['price_cents' => 1000, 'stock' => 10]);
    $second = Product::factory()->create(['price_cents' => 250, 'stock' => 5]);
    CartItem::factory()->create(['user_id' => $client->id, 'product_id' => $first->id, 'quantity' => 2]);
    CartItem::factory()->create(['user_id' => $client->id, 'product_id' => $second->id, 'quantity' => 3]);

    $response = $this->actingAs($client, 'sanctum')
        ->postJson('/api/checkout', checkoutPayload($delivery));

    $response->assertCreated();

    $order = Order::query()->where('user_id', $client->id)->sole();
    expect($order->status->value)->toBe('processing')
        ->and($order->payment_method)->toBe('card')
        ->and($order->subtotal_cents)->toBe(2750)
        ->and($order->delivery_cents)->toBe(490)
        ->and($order->total_cents)->toBe(3240)
        ->and($order->estimated_at)->not->toBeNull();

    expect($order->items()->orderBy('product_id')->get())
        ->toHaveCount(2)
        ->sequence(
            fn ($item) => $item
                ->where('product_id', $first->id)
                ->where('name', $first->name)
                ->where('unit_price_cents', 1000)
                ->where('quantity', 2),
            fn ($item) => $item
                ->where('product_id', $second->id)
                ->where('unit_price_cents', 250)
                ->where('quantity', 3),
        );

    expect($first->fresh()->stock)->toBe(8)
        ->and($second->fresh()->stock)->toBe(2)
        ->and(CartItem::query()->where('user_id', $client->id)->count())->toBe(0);

    $response->assertJsonPath('id', $order->id)
        ->assertJsonPath('status', 'processing')
        ->assertJsonPath('subtotalCents', 2750)
        ->assertJsonPath('deliveryCents', 490)
        ->assertJsonPath('totalCents', 3240)
        ->assertJsonCount(2, 'items')
        ->assertJsonFragment(['productId' => $first->id, 'lineTotalCents' => 2000]);
});

it('refuses an order when a product is out of stock', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $delivery = DeliveryMethod::factory()->create();
    $product = Product::factory()->create(['price_cents' => 1000, 'stock' => 1]);
    CartItem::factory()->create(['user_id' => $client->id, 'product_id' => $product->id, 'quantity' => 2]);

    $this->actingAs($client, 'sanctum')
        ->postJson('/api/checkout', checkoutPayload($delivery))
        ->assertStatus(422);

    expect(Order::query()->where('user_id', $client->id)->count())->toBe(0)
        ->and($product->fresh()->stock)->toBe(1)
        ->and(CartItem::query()->where('user_id', $client->id)->count())->toBe(1);
});

it('refuses an order when the cart is empty', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $delivery = DeliveryMethod::factory()->create();

    $this->actingAs($client, 'sanctum')
        ->postJson('/api/checkout', checkoutPayload($delivery))
        ->assertStatus(422);

    expect(Order::query()->where('user_id', $client->id)->count())->toBe(0);
});

it('validates the checkout payload', function (array $overrides) {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $delivery = DeliveryMethod::factory()->create();
    $product = Product::factory()->create(['stock' => 5]);
    CartItem::factory()->create(['user_id' => $client->id, 'product_id' => $product->id, 'quantity' => 1]);

    $this->actingAs($client, 'sanctum')
        ->postJson('/api/checkout', checkoutPayload($delivery, $overrides))
        ->assertStatus(422);
})->with([
    'unknown delivery method' => [['deliveryMethodId' => 'missing']],
    'unknown payment method' => [['paymentMethod' => 'crypto']],
]);

it('rejects guests from checkout', function () {
    DeliveryMethod::factory()->create();

    $this->postJson('/api/checkout', [])->assertStatus(401);
});
