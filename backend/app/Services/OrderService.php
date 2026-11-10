<?php

namespace App\Services;

use App\Data\Checkout\PlaceOrderData;
use App\Data\Order\OrderData;
use App\Data\Order\OrderSummaryData;
use App\Enums\OrderStatus;
use App\Models\CartItem;
use App\Models\DeliveryMethod;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /** @return list<OrderSummaryData> */
    public function list(User $user, ?string $status): array
    {
        return OrderSummaryData::collect(
            Order::query()
                ->where('user_id', $user->id)
                ->when($status !== null, fn ($query) => $query->where('status', $status))
                ->with('items')
                ->latest()
                ->get()
        )->values()->all();
    }

    public function findForUser(User $user, Order $order): ?OrderData
    {
        if ($order->user_id !== $user->id) {
            return null;
        }

        return OrderData::fromModel($order);
    }

    public function place(User $user, PlaceOrderData $data): OrderData
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

            /** @var array<string, Product> $products */
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

            return OrderData::fromModel($order);
        });
    }
}
