<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('category_id');
            $table->string('supplier_id');
            $table->unsignedInteger('price_cents');
            $table->integer('stock');
            $table->text('description');
            $table->jsonb('specs');
            $table->string('image');
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            $table->foreign('supplier_id')->references('id')->on('suppliers')->cascadeOnDelete();
        });

        Schema::create('delivery_method_product', function (Blueprint $table) {
            $table->string('delivery_method_id');
            $table->string('product_id');
            $table->primary(['delivery_method_id', 'product_id']);
            $table->foreign('delivery_method_id')->references('id')->on('delivery_methods')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_method_product');
        Schema::dropIfExists('products');
    }
};
