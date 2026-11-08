<?php

namespace App\Http\Controllers\Api\Admin;

use App\Data\Admin\StockUpdateData;
use App\Data\Catalogue\DeliveryMethodData;
use App\Data\Catalogue\ProductData;
use App\Data\Catalogue\SupplierData;
use App\Enums\StockStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;

class StockController extends Controller
{
    public function update(Product $product, StockUpdateData $data): ProductData
    {
        $product->update(['stock' => $data->stock]);

        $product->load(['category', 'supplier', 'deliveryMethods']);

        return new ProductData(
            id: $product->id,
            name: $product->name,
            description: $product->description,
            priceCents: $product->price_cents,
            stock: $product->stock,
            stockStatus: StockStatus::fromStock($product->stock),
            image: $product->image,
            specs: $product->specs ?? [],
            supplier: $product->supplier !== null ? SupplierData::from($product->supplier) : null,
            deliveryMethods: DeliveryMethodData::collect($product->deliveryMethods)->values()->all(),
            categoryId: $product->category_id,
            categoryName: $product->category->name,
        );
    }
}
