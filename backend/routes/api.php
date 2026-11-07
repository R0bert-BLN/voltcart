<?php

use App\Data\PingData;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => new PingData(ok: true));
