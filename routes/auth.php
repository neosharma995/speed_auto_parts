<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordResetOtpController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register/send-otp', [RegisteredUserController::class, 'sendOtp'])
        ->middleware('throttle:10,1')
        ->name('register.send-otp');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetOtpController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetOtpController::class, 'sendOtp'])
        ->middleware('throttle:10,1')
        ->name('password.email');

    Route::post('forgot-password/reset', [PasswordResetOtpController::class, 'reset'])
        ->middleware('throttle:10,1')
        ->name('password.otp-reset');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
