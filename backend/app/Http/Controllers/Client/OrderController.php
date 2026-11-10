<?php

namespace App\Http\Controllers\Client;

use App\Data\Client\OrderData;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Client\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        return response()->json(
            $this->orders->list($request->user(), is_string($status) && $status !== '' ? $status : null),
        );
    }

    public function show(Request $request, Order $order): OrderData
    {
        $orderData = $this->orders->findForUser($request->user(), $order);
        abort_if($orderData === null, 404);

        return $orderData;
    }
}
