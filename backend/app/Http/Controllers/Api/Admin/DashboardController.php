<?php

namespace App\Http\Controllers\Api\Admin;

use App\Data\Admin\DashboardData;
use App\Data\Catalogue\ProductSummaryData;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Low stock is 1–5; zero is reported as out of stock (same as StockStatus).
        $lowStock = Product::query()
            ->whereBetween('stock', [1, 5])
            ->orderBy('stock')
            ->orderBy('name')
            ->orderBy('id')
            ->get();

        return response()->json(new DashboardData(
            products: Product::count(),
            categories: Category::count(),
            lowStock: $lowStock->count(),
            outOfStock: Product::query()->where('stock', 0)->count(),
            lowStockProducts: ProductSummaryData::collect($lowStock)->values()->all(),
        ));
    }
}
