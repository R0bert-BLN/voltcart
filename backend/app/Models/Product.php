<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['id', 'name', 'category_id', 'supplier_id', 'price_cents', 'stock', 'description', 'specs', 'image'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $casts = [
        'specs' => 'array',
    ];

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Supplier, $this> */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /** @return BelongsToMany<DeliveryMethod, $this> */
    public function deliveryMethods(): BelongsToMany
    {
        return $this->belongsToMany(DeliveryMethod::class);
    }

    /** @param  Builder<Product>  $query */
    #[Scope]
    protected function search(Builder $query, string $term): void
    {
        $escaped = str_replace('%', '\%', addcslashes($term, '\_'));

        $query->where(fn (Builder $q) => $q
            ->where('name', 'ilike', "%{$escaped}%")
            ->orWhere('description', 'ilike', "%{$escaped}%"));
    }

    /** @param  Builder<Product>  $query */
    #[Scope]
    protected function inStock(Builder $query): void
    {
        $query->where('stock', '>', 0);
    }

    /**
     * @param  Builder<Product>  $query
     * @param  array{category?: string, search?: string, in_stock?: bool}  $filters
     */
    #[Scope]
    protected function matching(Builder $query, array $filters): void
    {
        if (isset($filters['category'])) {
            $query->where('category_id', $filters['category']);
        }

        if (isset($filters['search'])) {
            $query->search($filters['search']);
        }

        if ($filters['in_stock'] ?? false) {
            $query->inStock();
        }
    }
}
