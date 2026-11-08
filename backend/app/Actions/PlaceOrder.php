<?php

namespace App\Actions;

use App\Data\Checkout\PlaceOrderData;
use App\Data\Order\OrderData;
use App\Data\Order\OrderItemData;
use App\Enums\OrderStatus;
use App\Models\CartItem;
use App\Models\DeliveryMethod;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PlaceOrder
{
    public function __invoke(User $user, PlaceOrderData $data): OrderData
    {
        return DB::transaction(function () use ($user, $data): OrderData {
            $cartItems = CartItem::query()
                ->where('user_id', $user->id)
                ->with('product')
                ->orderBy('product_id')
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart is empty.'],
                ]);
            }

            /** @var array<int, Product> $products */
            $products = Product::query()
                ->whereIn('id', $cartItems->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cartItems as $item) {
                $product = $products[$item->product_id];

                if ($product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => ["Not enough stock for {$product->name}."],
                    ]);
                }
            }

            /** @var DeliveryMethod $deliveryMethod */
            $deliveryMethod = DeliveryMethod::query()->findOrFail($data->deliveryMethodId);

            $subtotalCents = $cartItems->sum(
                fn (CartItem $item): int => $item->product->price_cents * $item->quantity,
            );
            $deliveryCents = $deliveryMethod->price_cents;

            $order = Order::create([
                'id' => (string) Str::ulid(),
                'user_id' => $user->id,
                'status' => OrderStatus::Processing,
                'delivery_method_id' => $deliveryMethod->id,
                'payment_method' => $data->paymentMethod,
                'contact_name' => $data->contactName,
                'contact_phone' => $data->contactPhone,
                'address_line1' => $data->addressLine1,
                'postal_code' => $data->postalCode,
                'city' => $data->city,
                'country' => $data->country,
                'subtotal_cents' => $subtotalCents,
                'delivery_cents' => $deliveryCents,
                'total_cents' => $subtotalCents + $deliveryCents,
                'estimated_at' => now()->addDays($deliveryMethod->days),
            ]);

            foreach ($cartItems as $item) {
                $product = $products[$item->product_id];

                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $item->product->name,
                    'unit_price_cents' => $item->product->price_cents,
                    'quantity' => $item->quantity,
                ]);

                $product->decrement('stock', $item->quantity);
            }

            CartItem::query()->where('user_id', $user->id)->delete();

            return new OrderData(
                id: $order->id,
                status: $order->status->value,
                paymentMethod: $order->payment_method,
                subtotalCents: $order->subtotal_cents,
                deliveryCents: $order->delivery_cents,
                totalCents: $order->total_cents,
                estimatedAt: $order->estimated_at?->toISOString(),
                items: $cartItems->map(fn (CartItem $item): OrderItemData => new OrderItemData(
                    productId: $item->product->id,
                    name: $item->product->name,
                    unitPriceCents: $item->product->price_cents,
                    quantity: $item->quantity,
                    lineTotalCents: $item->product->price_cents * $item->quantity,
                ))->values()->all(),
            );
        });
    }
}
