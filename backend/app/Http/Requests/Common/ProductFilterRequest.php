<?php

namespace App\Http\Requests\Common;

use Illuminate\Foundation\Http\FormRequest;

class ProductFilterRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'exists:categories,id'],
            'in_stock' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /** @return array<string, mixed> */
    public function filters(): array
    {
        $filters = $this->safe()->except('page');
        $filters['in_stock'] = filter_var($filters['in_stock'] ?? false, FILTER_VALIDATE_BOOL);

        return $filters;
    }

    public function page(): int
    {
        return (int) ($this->validated('page') ?? 1);
    }
}
