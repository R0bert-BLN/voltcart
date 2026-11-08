<?php

namespace App\Http\Controllers\Api;

use App\Actions\PlaceOrder;
use App\Data\Checkout\PlaceOrderData;
use App\Data\Order\OrderData;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function store(Request $request, PlaceOrderData $data): OrderData
    {
        return app(PlaceOrder::class)($request->user(), $data);
    }
}
