<?php

namespace App\Http\Controllers\Admin;

use App\Data\Admin\StockUpdateData;
use App\Data\Common\ProductData;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Admin\StockService;

class StockController extends Controller
{
    public function __construct(private readonly StockService $stock) {}

    public function update(Product $product, StockUpdateData $data): ProductData
    {
        return $this->stock->update($product, $data);
    }
}
