<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'id' => Str::slug($name),
            'name' => ucfirst($name),
            'icon' => fake()->randomElement(['laptop', 'smartphone', 'battery-charging', 'cable', 'headphones', 'watch']),
        ];
    }
}
