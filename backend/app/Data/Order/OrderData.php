<?php

namespace App\Data\Order;

use App\Models\Order;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class OrderData extends Data
{
    /**
     * @param  array<int, OrderItemData>  $items
     */
    public function __construct(
        public string $id,
        public string $status,
        public string $paymentMethod,
        public int $subtotalCents,
        public int $deliveryCents,
        public int $totalCents,
        public ?string $estimatedAt,
        public string $createdAt,
        public array $items,
        public string $contactName,
        public string $contactPhone,
        public string $addressLine1,
        public string $postalCode,
        public string $city,
        public string $country,
        public string $deliveryMethodName,
        public int $deliveryMethodDays,
    ) {}

    public static function fromModel(Order $order): self
    {
        $order->loadMissing(['items', 'deliveryMethod']);

        return new self(
            id: $order->id,
            status: $order->status->value,
            paymentMethod: $order->payment_method,
            subtotalCents: $order->subtotal_cents,
            deliveryCents: $order->delivery_cents,
            totalCents: $order->total_cents,
            estimatedAt: $order->estimated_at?->toISOString(),
            createdAt: $order->created_at->toISOString(),
            items: $order->items->map(fn ($item): OrderItemData => new OrderItemData(
                productId: $item->product_id,
                name: $item->name,
                unitPriceCents: $item->unit_price_cents,
                quantity: $item->quantity,
                lineTotalCents: $item->unit_price_cents * $item->quantity,
            ))->values()->all(),
            contactName: $order->contact_name,
            contactPhone: $order->contact_phone,
            addressLine1: $order->address_line1,
            postalCode: $order->postal_code,
            city: $order->city,
            country: $order->country,
            deliveryMethodName: $order->deliveryMethod->name,
            deliveryMethodDays: $order->deliveryMethod->days,
        );
    }
}
