<?php

namespace App\Http\Controllers\Api;

use App\Data\Cart\CartData;
use App\Data\Cart\CartLineData;
use App\Data\Cart\CartUpdateData;
use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CartController extends Controller
{
    public function index(Request $request): CartData
    {
        return $this->cartData($request->user());
    }

    // Sets the quantity for a product; the stored quantity never exceeds the stock.
    public function update(Request $request, Product $product, CartUpdateData $data): CartData
    {
        $user = $request->user();
        $quantity = min($data->quantity, $product->stock);

        if ($quantity < 1) {
            $this->deleteLine($user, $product->id);
        } else {
            CartItem::query()->updateOrCreate([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ], ['quantity' => $quantity]);
        }

        return $this->cartData($user);
    }

    public function destroy(Request $request, string $productId): Response
    {
        $this->deleteLine($request->user(), $productId);

        return response()->noContent();
    }

    // Merges the guest cart the frontend kept while logged out into the stored cart.
    // The guest quantity wins for products already in the cart, always capped at stock.
    public function merge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['present', 'array'],
            'items.*.productId' => ['required', 'string', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        $user = $request->user();
        /** @var array<int, array{productId: string, quantity: int}> $guestItems */
        $guestItems = $validated['items'];
        $items = collect($guestItems);
        $products = Product::query()
            ->whereIn('id', $items->pluck('productId'))
            ->get()
            ->keyBy('id');

        foreach ($items as $item) {
            $product = $products[$item['productId']] ?? null;

            if ($product === null) {
                continue;
            }

            $quantity = min($item['quantity'], $product->stock);

            if ($quantity < 1) {
                continue;
            }

            CartItem::query()->updateOrCreate([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ], ['quantity' => $quantity]);
        }

        return response()->json($this->cartData($user));
    }

    private function deleteLine(User $user, string $productId): void
    {
        CartItem::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();
    }

    private function cartData(User $user): CartData
    {
        $items = CartItem::query()
            ->where('user_id', $user->id)
            ->with('product')
            ->orderBy('product_id')
            ->get();

        $lines = $items
            ->map(fn (CartItem $item): CartLineData => new CartLineData(
                productId: $item->product->id,
                name: $item->product->name,
                priceCents: $item->product->price_cents,
                quantity: $item->quantity,
                lineTotalCents: $item->product->price_cents * $item->quantity,
                image: $item->product->image,
            ))
            ->values()
            ->all();

        return new CartData(
            lines: $lines,
            subtotalCents: array_sum(array_map(
                fn (CartLineData $line): int => $line->lineTotalCents,
                $lines,
            )),
        );
    }
}
