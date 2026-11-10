<?php

namespace App\Http\Controllers;

use App\Data\Checkout\PlaceOrderData;
use App\Data\Order\OrderData;
use App\Services\OrderService;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function store(Request $request, PlaceOrderData $data): OrderData
    {
        return $this->orders->place($request->user(), $data);
    }
}
