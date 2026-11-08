<?php

use App\Models\Category;
use App\Models\DeliveryMethod;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

function seedCatalogue(): void
{
    $laptops = Category::factory()->create(['id' => 'laptops', 'name' => 'Laptops']);
    $audio = Category::factory()->create(['id' => 'audio', 'name' => 'Audio']);

    $northlane = Supplier::factory()->create(['id' => 'northlane', 'name' => 'Northlane']);
    $kestrel = Supplier::factory()->create(['id' => 'kestrel', 'name' => 'Kestrel']);

    $standard = DeliveryMethod::factory()->create(['id' => 'standard', 'name' => 'Standard']);

    Product::factory()->create([
        'id' => 'lp-aster-14', 'name' => 'Aster Air 14', 'category_id' => $laptops->id,
        'supplier_id' => $northlane->id, 'price_cents' => 114900, 'stock' => 18,
        'created_at' => Carbon::parse('2026-10-28'),
    ]);
    Product::factory()->create([
        'id' => 'lp-aster-16', 'name' => 'Aster Pro 16', 'category_id' => $laptops->id,
        'supplier_id' => $kestrel->id, 'price_cents' => 189900, 'stock' => 0,
        'created_at' => Carbon::parse('2026-10-12'),
    ]);
    Product::factory()->create([
        'id' => 'au-halden-nc', 'name' => 'Halden NC Headphones', 'category_id' => $audio->id,
        'supplier_id' => $northlane->id, 'price_cents' => 27900, 'stock' => 32,
        'created_at' => Carbon::parse('2026-10-21'),
    ]);

    Product::query()->find('lp-aster-14')->deliveryMethods()->attach($standard);
}

function sellProduct(Product $product, int $quantity): void
{
    $order = Order::create([
        'id' => 'order-'.Str::random(8),
        'user_id' => User::factory()->create()->id,
        'status' => 'delivered',
        'delivery_method_id' => 'standard',
        'payment_method' => 'card',
        'contact_name' => 'Test Buyer',
        'contact_phone' => '+123456789',
        'address_line1' => 'Volt Street 1',
        'postal_code' => '1234 AB',
        'city' => 'Voltstad',
        'country' => 'Netherlands',
        'subtotal_cents' => $product->price_cents * $quantity,
        'delivery_cents' => 0,
        'total_cents' => $product->price_cents * $quantity,
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'name' => $product->name,
        'unit_price_cents' => $product->price_cents,
        'quantity' => $quantity,
    ]);
}

function returnedIds(string $uri): array
{
    return test()->getJson($uri)->assertOk()->json('data.*.id');
}

it('lists categories with their product counts', function () {
    seedCatalogue();
    Product::factory()->create(['category_id' => 'laptops']);

    $this->getJson('/api/categories')
        ->assertOk()
        ->assertJson([
            ['id' => 'audio', 'name' => 'Audio', 'icon' => Category::find('audio')->icon, 'productsCount' => 1],
            ['id' => 'laptops', 'name' => 'Laptops', 'icon' => Category::find('laptops')->icon, 'productsCount' => 3],
        ]);
});

it('filters products by category', function () {
    seedCatalogue();

    expect(returnedIds('/api/products?category=audio'))->toBe(['au-halden-nc']);
});

it('filters products by search term', function () {
    seedCatalogue();

    expect(returnedIds('/api/products?search=aster'))->toBe(['lp-aster-14', 'lp-aster-16']);
    expect(returnedIds('/api/products?search=headphones'))->toBe(['au-halden-nc']);
});

it('filters products by price range', function () {
    seedCatalogue();

    expect(returnedIds('/api/products?price_min=50000&price_max=150000'))->toBe(['lp-aster-14']);

    // Only the lower bound applies.
    expect(returnedIds('/api/products?price_min=100000'))->toBe(['lp-aster-14', 'lp-aster-16']);

    // Only the upper bound applies.
    expect(returnedIds('/api/products?price_max=40000'))->toBe(['au-halden-nc']);
});

it('filters products by supplier', function () {
    seedCatalogue();

    expect(returnedIds('/api/products?supplier=kestrel'))->toBe(['lp-aster-16']);
});

it('filters products by delivery method', function () {
    seedCatalogue();

    expect(returnedIds('/api/products?delivery_method=standard'))->toBe(['lp-aster-14']);
});

it('filters in stock products only', function () {
    seedCatalogue();

    expect(returnedIds('/api/products?in_stock=1'))->toBe(['lp-aster-14', 'au-halden-nc']);
});

it('sorts products by price ascending and descending', function () {
    seedCatalogue();

    expect(returnedIds('/api/products?sort=price_asc'))->toBe(['au-halden-nc', 'lp-aster-14', 'lp-aster-16']);
    expect(returnedIds('/api/products?sort=price_desc'))->toBe(['lp-aster-16', 'lp-aster-14', 'au-halden-nc']);
});

it('sorts products by newest', function () {
    seedCatalogue();

    expect(returnedIds('/api/products?sort=newest'))->toBe(['lp-aster-14', 'au-halden-nc', 'lp-aster-16']);
});

it('sorts products by popularity, the quantity sold', function () {
    seedCatalogue();

    sellProduct(Product::find('au-halden-nc'), quantity: 2);
    sellProduct(Product::find('lp-aster-16'), quantity: 7);
    sellProduct(Product::find('lp-aster-14'), quantity: 3);

    expect(returnedIds('/api/products?sort=popular'))->toBe(['lp-aster-16', 'lp-aster-14', 'au-halden-nc']);
});

it('paginates products twelve per page', function () {
    seedCatalogue();
    Product::factory()->count(11)->create();

    $page1 = $this->getJson('/api/products')
        ->assertOk()
        ->assertJsonCount(12, 'data')
        ->assertJsonPath('meta.page', 1)
        ->assertJsonPath('meta.total', 14)
        ->assertJsonPath('meta.last_page', 2);

    $page1Ids = $page1->json('data.*.id');

    $page2Ids = $this->getJson('/api/products?page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.page', 2)
        ->json('data.*.id');

    expect(array_intersect($page1Ids, $page2Ids))->toBeEmpty();
});

it('combines filters, sort and pagination', function () {
    seedCatalogue();
    Product::factory()->create([
        'id' => 'au-halden-pro', 'name' => 'Halden Pro Headphones', 'category_id' => 'audio',
        'supplier_id' => 'kestrel', 'price_cents' => 32900, 'stock' => 5,
        'created_at' => Carbon::parse('2026-10-30'),
    ]);

    expect(returnedIds('/api/products?category=audio&search=halden&sort=price_desc&page=1'))
        ->toBe(['au-halden-pro', 'au-halden-nc']);
});

it('rejects invalid filters', function () {
    $this->getJson('/api/products?category=missing&sort=gossip')->assertUnprocessable();
});
