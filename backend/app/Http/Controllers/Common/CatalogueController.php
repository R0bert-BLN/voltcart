<?php

namespace App\Http\Controllers\Common;

use App\Data\Common\ProductData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Common\CatalogueProductsRequest;
use App\Models\Product;
use App\Services\Common\CatalogueService;
use Illuminate\Http\JsonResponse;

class CatalogueController extends Controller
{
    public function __construct(private readonly CatalogueService $catalogue) {}

    public function categories(): JsonResponse
    {
        return response()->json($this->catalogue->categories());
    }

    public function products(CatalogueProductsRequest $request): JsonResponse
    {
        return response()->json($this->catalogue->products($request->filters(), $request->page()));
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
