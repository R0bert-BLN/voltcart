<?php

use App\Models\Category;
use App\Models\DeliveryMethod;
use App\Models\Product;
use App\Models\Supplier;

it('creates a product with its relations', function () {
    $category = Category::factory()->create();
    $supplier = Supplier::factory()->create();
    $methods = DeliveryMethod::factory()
        ->count(2)
        ->sequence(['id' => 'standard'], ['id' => 'express'])
        ->create();

    $product = Product::factory()
        ->for($category, 'category')
        ->for($supplier, 'supplier')
        ->create();

    $product->deliveryMethods()->attach($methods);

    expect($product)
        ->exists->toBeTrue()
        ->price_cents->toBeInt()
        ->stock->toBeInt()
        ->specs->toBeArray()
        ->and($product->category->is($category))->toBeTrue()
        ->and($product->supplier->is($supplier))->toBeTrue()
        ->and($product->deliveryMethods)->toHaveCount(2);
});
