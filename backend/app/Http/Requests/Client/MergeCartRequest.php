<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class MergeCartRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'items' => ['present', 'array'],
            'items.*.productId' => ['required', 'string', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ];
    }

    /** @return list<array{productId: string, quantity: int}> */
    public function items(): array
    {
        /** @var list<array{productId: string, quantity: int}> */
        return array_values($this->validated('items'));
    }
}
