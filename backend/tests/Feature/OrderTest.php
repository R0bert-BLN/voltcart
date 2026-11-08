<?php

use App\Enums\OrderStatus;
use App\Models\DeliveryMethod;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

it('creates an order with two items', function () {
    $user = User::factory()->create();
    $delivery = DeliveryMethod::factory()->create();
    $product = Product::factory()->create();

    $order = Order::create([
        'id' => 'VC-20431',
        'user_id' => $user->id,
        'status' => OrderStatus::Processing,
        'delivery_method_id' => $delivery->id,
        'payment_method' => 'card',
        'contact_name' => 'Ada Lovelace',
        'contact_phone' => '+49 30 123456',
        'address_line1' => 'Torstraße 1',
        'postal_code' => '10119',
        'city' => 'Berlin',
        'country' => 'Germany',
        'subtotal_cents' => 199900,
        'delivery_cents' => 999,
        'total_cents' => 200899,
        'estimated_at' => now()->addDays(3),
    ]);

    $itemOne = $order->items()->create([
        'product_id' => $product->id,
        'name' => $product->name,
        'unit_price_cents' => $product->price_cents,
        'quantity' => 1,
    ]);

    $itemTwo = $order->items()->create([
        'product_id' => $product->id,
        'name' => $product->name,
        'unit_price_cents' => $product->price_cents,
        'quantity' => 2,
    ]);

    expect($order->status)->toBe(OrderStatus::Processing)
        ->and($order->items)->toHaveCount(2)
        ->and($itemOne->exists)->toBeTrue()
        ->and($itemTwo->exists)->toBeTrue()
        ->and($itemOne->order->is($order))->toBeTrue();
});
