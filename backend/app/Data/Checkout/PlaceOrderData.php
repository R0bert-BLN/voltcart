<?php

namespace App\Data\Checkout;

use Spatie\LaravelData\Data;

class PlaceOrderData extends Data
{
    public function __construct(
        public string $deliveryMethodId,
        public string $paymentMethod,
        public string $contactName,
        public string $contactPhone,
        public string $addressLine1,
        public string $postalCode,
        public string $city,
        public string $country,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'deliveryMethodId' => ['required', 'string', 'exists:delivery_methods,id'],
            'paymentMethod' => ['required', 'string', 'in:card,cod'],
            'contactName' => ['required', 'string', 'max:120'],
            'contactPhone' => ['required', 'string', 'max:40'],
            'addressLine1' => ['required', 'string', 'max:200'],
            'postalCode' => ['required', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:120'],
            'country' => ['required', 'string', 'max:120'],
        ];
    }
}
