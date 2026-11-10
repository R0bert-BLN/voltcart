<?php

namespace App\Http\Controllers;

use App\Data\Cart\CartData;
use App\Data\Cart\CartUpdateData;
use App\Models\Product;
use App\Services\CartService;
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

    public function merge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['present', 'array'],
            'items.*.productId' => ['required', 'string', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        /** @var array<int, array{productId: string, quantity: int}> $guestItems */
        $guestItems = $validated['items'];

        return response()->json($this->cart->merge($request->user(), $guestItems));
    }
}
