<?php

namespace App\Services;

use App\Data\Wishlist\WishlistItemData;
use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;

class WishlistService
{
    /** @return list<WishlistItemData> */
    public function list(User $user): array
    {
        return WishlistItemData::collect(
            WishlistItem::query()
                ->where('user_id', $user->id)
                ->with('product.category')
                ->orderBy('added_at')
                ->orderBy('id')
                ->get()
        )->values()->all();
    }

    public function add(User $user, Product $product): WishlistItem
    {
        $item = WishlistItem::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ], ['added_at' => now()]);
        $item->load('product.category');

        return $item;
    }

    public function remove(User $user, string $productId): void
    {
        WishlistItem::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();
    }
}
