<?php

namespace App\Http\Controllers\Api;

use App\Data\Wishlist\WishlistItemData;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = WishlistItem::query()
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json(WishlistItemData::collect($items));
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $item = WishlistItem::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ], ['added_at' => now()]);

        return response()->json(WishlistItemData::fromModel($item), $item->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, string $productId): Response
    {
        WishlistItem::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->noContent();
    }
}
