<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->string('delivery_method_id');
            $table->string('payment_method');
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->string('address_line1');
            $table->string('postal_code');
            $table->string('city');
            $table->string('country');
            $table->unsignedInteger('subtotal_cents');
            $table->unsignedInteger('delivery_cents');
            $table->unsignedInteger('total_cents');
            $table->timestamp('estimated_at')->nullable();
            $table->timestamps();

            $table->foreign('delivery_method_id')->references('id')->on('delivery_methods');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id');
            $table->string('product_id');
            $table->string('name');
            $table->unsignedInteger('unit_price_cents');
            $table->unsignedInteger('quantity');
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
