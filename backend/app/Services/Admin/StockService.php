<?php

namespace App\Services\Admin;

use App\Data\Admin\StockUpdateData;
use App\Models\Product;

class StockService
{
    public function update(Product $product, StockUpdateData $data): Product
    {
        $product->update(['stock' => $data->stock]);

        return $product->refresh();
    }
}
