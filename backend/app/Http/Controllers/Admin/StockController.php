<?php

namespace App\Http\Controllers\Admin;

use App\Data\Admin\StockUpdateData;
use App\Data\Catalogue\ProductData;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Admin\StockService;
use App\Services\CatalogueService;

class StockController extends Controller
{
    public function __construct(
        private readonly StockService $stock,
        private readonly CatalogueService $catalogue,
    ) {}

    public function update(Product $product, StockUpdateData $data): ProductData
    {
        return $this->catalogue->product($this->stock->update($product, $data));
    }
}
