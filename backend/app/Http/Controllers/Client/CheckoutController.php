<?php

namespace App\Http\Controllers\Client;

use App\Data\Client\OrderData;
use App\Data\Client\PlaceOrderData;
use App\Http\Controllers\Controller;
use App\Services\Client\OrderService;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function store(Request $request, PlaceOrderData $data): OrderData
    {
        return $this->orders->place($request->user(), $data);
    }
}
