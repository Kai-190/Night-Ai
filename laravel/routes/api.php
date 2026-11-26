<?php

use App\Http\Controllers\Api\PayMongoCheckoutController;
use App\Http\Controllers\Api\PayMongoWebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:10,1')->post(
    '/payments/gcash/checkout',
    [PayMongoCheckoutController::class, 'create']
);

Route::middleware('throttle:30,1')->get(
    '/payments/{reference}',
    [PayMongoCheckoutController::class, 'show']
)->whereUuid('reference');

Route::post('/webhooks/paymongo', PayMongoWebhookController::class);
