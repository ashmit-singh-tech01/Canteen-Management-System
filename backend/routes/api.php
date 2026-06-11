<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CashfreeController;

/*
|--------------------------------------------------------------------------
| MENU ROUTES
|--------------------------------------------------------------------------
*/

Route::prefix('menu')->group(function () {
    Route::get('/', [MenuController::class, 'index']);
    Route::post('/', [MenuController::class, 'store']);
    Route::put('/{id}', [MenuController::class, 'update']);
    Route::delete('/{id}', [MenuController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| ORDER ROUTES
|--------------------------------------------------------------------------
*/

Route::prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);
    Route::patch('/{id}/status', [OrderController::class, 'updateStatus']);
});

/*
|--------------------------------------------------------------------------
| PAYMENT ROUTES (Cashfree)
|--------------------------------------------------------------------------
*/

Route::prefix('payment')->group(function () {
    Route::post('/create-order', [PaymentController::class, 'createOrder']);
    Route::any('/callback', [PaymentController::class, 'callback']);
});

/*
|--------------------------------------------------------------------------
| CASHFREE PAYMENT GATEWAY ROUTES
|--------------------------------------------------------------------------
*/

Route::prefix('cashfree')->group(function () {
    Route::post('/create-order', [CashfreeController::class, 'createOrder']);
    Route::post('/verify-payment', [CashfreeController::class, 'verifyPayment']);
    Route::post('/webhook', [CashfreeController::class, 'webhook']);
});