<?php

use App\Models\Category;
use App\Models\DeliveryMethod;
use App\Models\Supplier;

it('creates categories from the factory', function () {
    $category = Category::factory()->create([
        'id' => 'laptops',
        'name' => 'Laptops',
        'icon' => 'laptop',
    ]);

    expect($category)
        ->exists->toBeTrue()
        ->id->toBe('laptops')
        ->name->toBe('Laptops')
        ->icon->toBe('laptop')
        ->and(Category::find('laptops'))->not->toBeNull();
});

it('creates suppliers from the factory', function () {
    $supplier = Supplier::factory()->create([
        'id' => 'volt-gmbh',
        'name' => 'Volt GmbH',
        'country' => 'Germany',
    ]);

    expect($supplier)
        ->exists->toBeTrue()
        ->id->toBe('volt-gmbh')
        ->name->toBe('Volt GmbH')
        ->country->toBe('Germany')
        ->and(Supplier::find('volt-gmbh'))->not->toBeNull();
});

it('creates delivery methods from the factory', function () {
    $method = DeliveryMethod::factory()->create([
        'id' => 'express',
        'name' => 'Express delivery',
        'price_cents' => 999,
        'time' => '1 day',
        'days' => 1,
    ]);

    expect($method)
        ->exists->toBeTrue()
        ->id->toBe('express')
        ->name->toBe('Express delivery')
        ->price_cents->toBe(999)
        ->time->toBe('1 day')
        ->days->toBe(1)
        ->and(DeliveryMethod::find('express'))->not->toBeNull();
});
