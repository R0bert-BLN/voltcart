<?php

namespace Database\Factories;

use App\Models\DeliveryMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeliveryMethod>
 */
class DeliveryMethodFactory extends Factory
{
    public function definition(): array
    {
        $days = fake()->numberBetween(1, 10);

        return [
            'id' => 'standard',
            'name' => 'Standard delivery',
            'price_cents' => fake()->numberBetween(0, 999),
            'time' => "{$days} days",
            'days' => $days,
        ];
    }
}
