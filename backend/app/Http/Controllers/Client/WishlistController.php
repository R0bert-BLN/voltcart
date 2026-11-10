<?php

namespace App\Http\Controllers\Client;

use App\Data\Client\WishlistItemData;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Client\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WishlistController extends Controller
{
    public function __construct(private readonly WishlistService $wishlist) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->wishlist->list($request->user()));
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $item = $this->wishlist->add($request->user(), $product);

        return response()->json(
            WishlistItemData::fromModel($item),
            $item->wasRecentlyCreated ? 201 : 200,
        );
    }

    public function destroy(Request $request, string $productId): Response
    {
        $this->wishlist->remove($request->user(), $productId);

        return response()->noContent();
    }
}
