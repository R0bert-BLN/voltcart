<?php

namespace App\Data\Order;

use App\Models\Order;
use Spatie\LaravelData\Data;

class OrderSummaryData extends Data
{
    public function __construct(
        public string $id,
        public string $status,
        public string $paymentMethod,
        public int $subtotalCents,
        public int $deliveryCents,
        public int $totalCents,
        public ?string $estimatedAt,
        public string $createdAt,
        public int $itemCount,
    ) {}

    public static function fromModel(Order $order): self
    {
        return new self(
            id: $order->id,
            status: $order->status->value,
            paymentMethod: $order->payment_method,
            subtotalCents: $order->subtotal_cents,
            deliveryCents: $order->delivery_cents,
            totalCents: $order->total_cents,
            estimatedAt: $order->estimated_at?->toISOString(),
            createdAt: $order->created_at->toISOString(),
            itemCount: $order->items->sum('quantity'),
        );
    }
}
