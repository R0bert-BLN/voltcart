<?php

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum StockStatus: string
{
    case InStock = 'in_stock';
    case LowStock = 'low_stock';
    case OutOfStock = 'out_of_stock';

    public static function fromStock(int $stock): self
    {
        return match (true) {
            $stock <= 0 => self::OutOfStock,
            $stock <= 5 => self::LowStock,
            default => self::InStock,
        };
    }
}
