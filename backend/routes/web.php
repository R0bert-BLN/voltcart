<?php

use Illuminate\Support\Facades\Route;

// The backend is API only; the React app lives in frontend/.
Route::get('/', fn () => response()->json(['name' => config('app.name'), 'api' => url('/api')]));
