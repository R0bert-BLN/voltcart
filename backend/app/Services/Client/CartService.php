<?php

namespace App\Services\Client;

use App\Data\Client\CartData;
use App\Data\Client\CartLineData;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;

class CartService
{
    public function get(User $user): CartData
    {
        $lines = CartItem::query()
            ->where('user_id', $user->id)
            ->with('product')
            ->orderBy('product_id')
            ->get()
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

    public function update(User $user, Product $product, int $quantity): CartData
    {
        $this->setQuantity($user, $product, $quantity);

        return $this->get($user);
    }

    /** @param  list<array{productId: string, quantity: int}>  $guestItems */
    public function merge(User $user, array $guestItems): CartData
    {
        $products = Product::query()
            ->whereIn('id', array_column($guestItems, 'productId'))
            ->get()
            ->keyBy('id');

        foreach ($guestItems as $item) {
            $product = $products->get($item['productId']);

            if ($product === null) {
                continue;
            }

            $quantity = min($item['quantity'], $product->stock);

            if ($quantity >= 1) {
                $this->store($user, $product->id, $quantity);
            }
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

    private function setQuantity(User $user, Product $product, int $quantity): void
    {
        $quantity = min($quantity, $product->stock);

        if ($quantity < 1) {
            $this->remove($user, $product->id);

            return;
        }

        $this->store($user, $product->id, $quantity);
    }

    private function store(User $user, string $productId, int $quantity): void
    {
        CartItem::query()->updateOrCreate(
            ['user_id' => $user->id, 'product_id' => $productId],
            ['quantity' => $quantity],
        );
    }
}
