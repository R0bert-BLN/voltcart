<?php

namespace App\Http\Controllers\Admin;

use App\Data\Admin\StoreProductData;
use App\Data\Catalogue\ProductData;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Admin\ProductService;
use App\Services\CatalogueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $products,
        private readonly CatalogueService $catalogue,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'exists:categories,id'],
            'in_stock' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        return response()->json($this->products->paginate($validated));
    }

    public function store(StoreProductData $data): JsonResponse
    {
        $product = $this->products->create($data);

        return response()->json($this->catalogue->product($product), 201);
    }

    public function show(Product $product): ProductData
    {
        return $this->catalogue->product($product);
    }

    public function update(Product $product, StoreProductData $data): ProductData
    {
        return $this->catalogue->product($this->products->update($product, $data));
    }

    public function destroy(Product $product): Response
    {
        $this->products->delete($product);

        return response()->noContent();
    }
}
