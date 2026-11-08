<?php

namespace App\Data\Wishlist;

use App\Models\WishlistItem;
use Carbon\CarbonInterface;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class WishlistItemData extends Data
{
    public function __construct(
        public string $productId,
        public string $name,
        public int $priceCents,
        public string $image,
        public CarbonInterface $addedAt,
        public int $stock,
        public string $categoryId,
        public string $categoryName,
    ) {}

    public static function fromModel(WishlistItem $item): self
    {
        $product = $item->product;

        return new self(
            productId: $product->id,
            name: $product->name,
            priceCents: $product->price_cents,
            image: $product->image,
            addedAt: $item->added_at,
            stock: $product->stock,
            categoryId: $product->category_id,
            categoryName: $product->category->name,
        );
    }
}
