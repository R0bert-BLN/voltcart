<?php

namespace App\Services\Client;

use App\Data\Client\WishlistItemData;
use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;

class WishlistService
{
    /** @return list<WishlistItemData> */
    public function list(User $user): array
    {
        $items = WishlistItem::query()
            ->where('user_id', $user->id)
            ->with('product.category')
            ->orderBy('added_at')
            ->orderBy('id')
            ->get();

        return WishlistItemData::collect($items)->values()->all();
    }

    public function add(User $user, Product $product): WishlistItem
    {
        $item = WishlistItem::query()->firstOrCreate(
            ['user_id' => $user->id, 'product_id' => $product->id],
            ['added_at' => now()],
        );

        return $item->load('product.category');
    }

    public function remove(User $user, string $productId): void
    {
        WishlistItem::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();
    }
}
