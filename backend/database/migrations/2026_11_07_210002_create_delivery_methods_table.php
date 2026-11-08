<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_methods', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('time');
            $table->unsignedInteger('price_cents');
            $table->unsignedInteger('days');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_methods');
    }
};
