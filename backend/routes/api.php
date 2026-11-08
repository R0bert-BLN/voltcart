<?php

use App\Data\PingData;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogueController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => new PingData(ok: true));

Route::get('/categories', [CatalogueController::class, 'categories']);
Route::get('/products', [CatalogueController::class, 'products']);
Route::get('/products/{product}', [CatalogueController::class, 'show']);
Route::get('/suppliers', [CatalogueController::class, 'suppliers']);
Route::get('/delivery-methods', [CatalogueController::class, 'deliveryMethods']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/ping', fn () => new PingData(ok: true));
});
