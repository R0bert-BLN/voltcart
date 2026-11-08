<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'id' => Str::slug($name),
            'name' => $name,
            'country' => fake()->country(),
        ];
    }
}
