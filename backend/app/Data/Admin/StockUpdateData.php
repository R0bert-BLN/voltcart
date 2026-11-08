<?php

namespace App\Data\Admin;

use Spatie\LaravelData\Data;

class StockUpdateData extends Data
{
    public function __construct(
        public int $stock,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'stock' => ['required', 'integer', 'min:0'],
        ];
    }
}
