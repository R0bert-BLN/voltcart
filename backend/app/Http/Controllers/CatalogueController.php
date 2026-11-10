<?php

namespace App\Http\Controllers;

use App\Data\Catalogue\ProductData;
use App\Models\Product;
use App\Services\CatalogueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogueController extends Controller
{
    public function __construct(private readonly CatalogueService $catalogue) {}

    public function categories(): JsonResponse
    {
        return response()->json($this->catalogue->categories());
    }

    public function products(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'exists:categories,id'],
            'search' => ['nullable', 'string', 'max:120'],
            'supplier' => ['nullable', 'string', 'exists:suppliers,id'],
            'delivery_method' => ['nullable', 'string', 'exists:delivery_methods,id'],
            'price_min' => ['nullable', 'integer', 'min:0'],
            'price_max' => ['nullable', 'integer', 'min:0'],
            'in_stock' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'string', 'in:popular,price_asc,price_desc,newest'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        return response()->json($this->catalogue->products($validated));
    }

    public function show(Product $product): ProductData
    {
        return $this->catalogue->product($product);
    }

    public function suppliers(): JsonResponse
    {
        return response()->json($this->catalogue->suppliers());
    }

    public function deliveryMethods(): JsonResponse
    {
        return response()->json($this->catalogue->deliveryMethods());
    }
}
