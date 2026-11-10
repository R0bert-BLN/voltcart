<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'id' => Str::slug($name),
            'name' => ucfirst($name),
            'category_id' => Category::factory(),
            'supplier_id' => Supplier::factory(),
            'price_cents' => fake()->numberBetween(99, 250000),
            'stock' => fake()->numberBetween(0, 500),
            'description' => fake()->paragraph(),
            'specs' => [
                ['label' => 'Warranty', 'value' => '24 months'],
                ['label' => 'Colour', 'value' => fake()->safeColorName()],
            ],
            'image' => 'products/'.Str::slug($name).'.jpg',
        ];
    }
}
