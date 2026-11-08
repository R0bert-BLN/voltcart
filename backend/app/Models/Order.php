<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id',
    'user_id',
    'status',
    'delivery_method_id',
    'payment_method',
    'contact_name',
    'contact_phone',
    'address_line1',
    'postal_code',
    'city',
    'country',
    'subtotal_cents',
    'delivery_cents',
    'total_cents',
    'estimated_at',
])]
class Order extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $casts = [
        'status' => OrderStatus::class,
        'estimated_at' => 'datetime',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<DeliveryMethod, $this> */
    public function deliveryMethod(): BelongsTo
    {
        return $this->belongsTo(DeliveryMethod::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
