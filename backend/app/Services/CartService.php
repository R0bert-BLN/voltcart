<?php

namespace App\Services;

use App\Data\Cart\CartData;
use App\Data\Cart\CartLineData;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;

class CartService
{
    public function get(User $user): CartData
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

    // Sets the quantity for a product; the stored quantity never exceeds the stock.
    public function update(User $user, Product $product, int $quantity): CartData
    {
        $quantity = min($quantity, $product->stock);

        if ($quantity < 1) {
            $this->remove($user, $product->id);
        } else {
            CartItem::query()->updateOrCreate([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ], ['quantity' => $quantity]);
        }

        return $this->get($user);
    }

    // Merges the guest cart the frontend kept while logged out into the stored
    // cart. The guest quantity wins for products already in the cart, always
    // capped at stock.
    /** @param  list<array{productId: string, quantity: int}>  $guestItems */
    public function merge(User $user, array $guestItems): CartData
    {
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

        return $this->get($user);
    }

    public function remove(User $user, string $productId): void
    {
        CartItem::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();
    }
}
