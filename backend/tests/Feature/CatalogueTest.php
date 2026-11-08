<?php

use App\Models\Category;
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
