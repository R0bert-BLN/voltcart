<?php

namespace App\Http\Requests\Common;

class CatalogueProductsRequest extends ProductFilterRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'supplier' => ['nullable', 'string', 'exists:suppliers,id'],
            'delivery_method' => ['nullable', 'string', 'exists:delivery_methods,id'],
            'price_min' => ['nullable', 'integer', 'min:0'],
            'price_max' => ['nullable', 'integer', 'min:0'],
            'sort' => ['nullable', 'string', 'in:popular,price_asc,price_desc,newest'],
        ];
    }
}
