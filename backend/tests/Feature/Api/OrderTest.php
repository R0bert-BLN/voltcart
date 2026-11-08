<?php

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\DeliveryMethod;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Str;

function createOrder(User $user, array $overrides = []): Order
{
    $delivery = DeliveryMethod::factory()->create(['id' => 'dm-'.Str::random(8)]);
    $createdAt = $overrides['created_at'] ?? null;
    unset($overrides['created_at']);

    $order = Order::create(array_merge([
        'id' => (string) Str::ulid(),
        'user_id' => $user->id,
        'status' => OrderStatus::Processing,
        'delivery_method_id' => $delivery->id,
        'payment_method' => 'card',
        'contact_name' => 'Maya Dupont',
        'contact_phone' => '+33 6 12 34 56 78',
        'address_line1' => '12 rue des Lilas',
        'postal_code' => '75011',
        'city' => 'Paris',
        'country' => 'France',
        'subtotal_cents' => 1000,
        'delivery_cents' => 490,
        'total_cents' => 1490,
        'estimated_at' => now()->addDays(3),
    ], $overrides));

    if ($createdAt !== null) {
        $order->timestamps = false;
        $order->created_at = $createdAt;
        $order->save();
    }

    return $order;
}

it('lists the user’s own orders newest first', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);

    $older = createOrder($client, ['created_at' => now()->subDays(2)]);
    $newer = createOrder($client, ['created_at' => now()->subDay()]);
    createOrder(User::factory()->create(['role' => UserRole::Client]), ['created_at' => now()]);

    $this->actingAs($client, 'sanctum')
        ->getJson('/api/orders')
        ->assertOk()
        ->assertJsonCount(2)
        ->assertJsonPath('0.id', $newer->id)
        ->assertJsonPath('1.id', $older->id)
        ->assertJsonPath('0.status', 'processing')
        ->assertJsonPath('0.totalCents', 1490);
});

it('filters the order list by status', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);

    createOrder($client, ['status' => OrderStatus::Processing]);
    $shipped = createOrder($client, ['status' => OrderStatus::Shipped]);

    $this->actingAs($client, 'sanctum')
        ->getJson('/api/orders?status=shipped')
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.id', $shipped->id);
});

it('shows an order with its items', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $order = createOrder($client);
    $product = Product::factory()->create();
    $order->items()->create([
        'product_id' => $product->id,
        'name' => 'USB-C charger',
        'unit_price_cents' => 1000,
        'quantity' => 2,
    ]);

    $this->actingAs($client, 'sanctum')
        ->getJson("/api/orders/{$order->id}")
        ->assertOk()
        ->assertJsonPath('id', $order->id)
        ->assertJsonPath('status', 'processing')
        ->assertJsonPath('paymentMethod', 'card')
        ->assertJsonPath('subtotalCents', 1000)
        ->assertJsonPath('totalCents', 1490)
        ->assertJsonCount(1, 'items')
        ->assertJsonPath('items.0.name', 'USB-C charger')
        ->assertJsonPath('items.0.quantity', 2)
        ->assertJsonPath('items.0.lineTotalCents', 2000)
        ->assertJsonPath('contactName', 'Maya Dupont')
        ->assertJsonPath('contactPhone', '+33 6 12 34 56 78')
        ->assertJsonPath('addressLine1', '12 rue des Lilas')
        ->assertJsonPath('postalCode', '75011')
        ->assertJsonPath('city', 'Paris')
        ->assertJsonPath('country', 'France')
        ->assertJsonPath('deliveryMethodDays', $order->deliveryMethod->days);
});

it('hides another user’s order', function () {
    $client = User::factory()->create(['role' => UserRole::Client]);
    $other = User::factory()->create(['role' => UserRole::Client]);
    $order = createOrder($other);

    $this->actingAs($client, 'sanctum')
        ->getJson("/api/orders/{$order->id}")
        ->assertNotFound();
});

it('rejects guests from the orders endpoints', function () {
    $order = createOrder(User::factory()->create(['role' => UserRole::Client]));

    $this->getJson('/api/orders')->assertStatus(401);
    $this->getJson("/api/orders/{$order->id}")->assertStatus(401);
});
