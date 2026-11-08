<?php

namespace App\Http\Controllers\Api;

use App\Data\Order\OrderData;
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

        return OrderData::fromModel($order);
    }
}
