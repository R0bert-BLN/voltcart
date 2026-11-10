<?php

namespace App\Http\Controllers\Client;

use App\Data\Client\CartData;
use App\Data\Client\CartUpdateData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\MergeCartRequest;
use App\Models\Product;
use App\Services\Client\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function index(Request $request): CartData
    {
        return $this->cart->get($request->user());
    }

    public function update(Request $request, Product $product, CartUpdateData $data): CartData
    {
        return $this->cart->update($request->user(), $product, $data->quantity);
    }

    public function destroy(Request $request, string $productId): Response
    {
        $this->cart->remove($request->user(), $productId);

        return response()->noContent();
    }

    public function merge(MergeCartRequest $request): JsonResponse
    {
        return response()->json($this->cart->merge($request->user(), $request->items()));
    }
}
