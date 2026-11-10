<?php

namespace App\Services\Admin;

use App\Data\Admin\DashboardData;
use App\Data\Common\ProductSummaryData;
use App\Enums\StockStatus;
use App\Models\Category;
use App\Models\Product;

class DashboardService
{
    public function stats(): DashboardData
    {
        $lowStock = Product::query()
            ->whereBetween('stock', [1, StockStatus::LOW_STOCK_THRESHOLD])
            ->orderBy('stock')
            ->orderBy('name')
            ->orderBy('id')
            ->get();

        return new DashboardData(
            products: Product::query()->count(),
            categories: Category::query()->count(),
            lowStock: $lowStock->count(),
            outOfStock: Product::query()->where('stock', 0)->count(),
            lowStockProducts: ProductSummaryData::collect($lowStock)->values()->all(),
        );
    }
}
