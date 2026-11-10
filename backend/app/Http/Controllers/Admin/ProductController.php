<?php

namespace App\Http\Controllers\Admin;

use App\Data\Admin\StoreProductData;
use App\Data\Common\ProductData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Common\ProductFilterRequest;
use App\Models\Product;
use App\Services\Admin\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products) {}

    public function index(ProductFilterRequest $request): JsonResponse
    {
        return response()->json($this->products->paginate($request->filters(), $request->page()));
    }

    public function store(StoreProductData $data): JsonResponse
    {
        return response()->json($this->products->create($data), 201);
    }

    public function show(Product $product): ProductData
    {
        return $this->products->show($product);
    }

    public function update(Product $product, StoreProductData $data): ProductData
    {
        return $this->products->update($product, $data);
    }

    public function destroy(Product $product): Response
    {
        $this->products->delete($product);

        return response()->noContent();
    }
}
