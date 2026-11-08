<?php

namespace App\Http\Controllers\Api;

use App\Data\Order\OrderData;
use App\Data\Order\OrderItemData;
use App\Data\Order\OrderSummaryData;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->when(
                is_string($request->query('status')) && $request->query('status') !== '',
                fn ($query) => $query->where('status', $request->query('status')),
            )
            ->with('items')
            ->latest()
            ->get();

        return response()->json(OrderSummaryData::collect($orders));
    }

    public function show(Request $request, Order $order): OrderData
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        $order->load('items');

        return new OrderData(
            id: $order->id,
            status: $order->status->value,
            paymentMethod: $order->payment_method,
            subtotalCents: $order->subtotal_cents,
            deliveryCents: $order->delivery_cents,
            totalCents: $order->total_cents,
            estimatedAt: $order->estimated_at?->toISOString(),
            items: $order->items->map(fn ($item): OrderItemData => new OrderItemData(
                productId: $item->product_id,
                name: $item->name,
                unitPriceCents: $item->unit_price_cents,
                quantity: $item->quantity,
                lineTotalCents: $item->unit_price_cents * $item->quantity,
            ))->values()->all(),
        );
    }
}
