<?php

namespace App\Data\Admin;

use App\Data\Catalogue\ProductSummaryData;
use Spatie\LaravelData\Data;

class DashboardData extends Data
{
    /**
     * @param  array<int, ProductSummaryData>  $lowStockProducts
     */
    public function __construct(
        public int $products,
        public int $categories,
        public int $lowStock,
        public int $outOfStock,
        public array $lowStockProducts,
    ) {}
}
