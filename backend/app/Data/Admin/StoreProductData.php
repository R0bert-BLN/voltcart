<?php

namespace App\Data\Admin;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class StoreProductData extends Data
{
    public function __construct(
        public string $name,
        public string $categoryId,
        public string $supplierId,
        public int $priceCents,
        public int $stock,
        public string $description,
        public string $image,
        /** @var array<int, array{label: string, value: string}> */
        public array $specs = [],
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'categoryId' => ['required', 'string', 'exists:categories,id'],
            'supplierId' => ['required', 'string', 'exists:suppliers,id'],
            'priceCents' => ['required', 'integer', 'min:1'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['required', 'string', 'max:5000'],
            'image' => ['required', 'string', 'max:255'],
            'specs' => ['nullable', 'array'],
            'specs.*.label' => ['required', 'string', 'max:80'],
            'specs.*.value' => ['required', 'string', 'max:80'],
        ];
    }
}
