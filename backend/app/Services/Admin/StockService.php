<?php

namespace App\Services\Admin;

use App\Data\Admin\StockUpdateData;
use App\Data\Common\ProductData;
use App\Models\Product;

class StockService
{
    public function update(Product $product, StockUpdateData $data): ProductData
    {
        $product->update(['stock' => $data->stock]);

        return ProductData::fromModel($product->refresh());
    }
}
