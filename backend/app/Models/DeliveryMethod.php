<?php

namespace App\Models;

use Database\Factories\DeliveryMethodFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id', 'name', 'price_cents', 'time', 'days'])]
class DeliveryMethod extends Model
{
    /** @use HasFactory<DeliveryMethodFactory> */
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;
}
