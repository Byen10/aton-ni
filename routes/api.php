<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\EquipmentController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Employee routes
Route::get('/employees', [EmployeeController::class, 'index']);
Route::get('/employees/current-holders', [EmployeeController::class, 'currentHolders']);
Route::get('/employees/pending-requests', [EmployeeController::class, 'pendingRequests']);
Route::get('/employees/verify-returns', [EmployeeController::class, 'verifyReturns']);
Route::post('/employees', [EmployeeController::class, 'store']);
Route::get('/employees/{id}', [EmployeeController::class, 'show']);
Route::put('/employees/{id}', [EmployeeController::class, 'update']);
Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);

// Request routes
Route::get('/requests', [RequestController::class, 'index']);
Route::post('/requests', [RequestController::class, 'store']);
Route::get('/requests/{id}', [RequestController::class, 'show']);
Route::put('/requests/{id}', [RequestController::class, 'update']);
Route::delete('/requests/{id}', [RequestController::class, 'destroy']);
Route::post('/requests/{id}/approve', [RequestController::class, 'approve']);
Route::post('/requests/{id}/reject', [RequestController::class, 'reject']);
Route::get('/requests/statistics', [RequestController::class, 'statistics']);

// Transaction routes
Route::get('/transactions/dashboard', [TransactionController::class, 'dashboard']);
Route::get('/transactions', [TransactionController::class, 'index']);
Route::post('/transactions', [TransactionController::class, 'store']);
Route::get('/transactions/{id}', [TransactionController::class, 'show']);
Route::put('/transactions/{id}', [TransactionController::class, 'update']);
Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
Route::post('/transactions/{id}/release', [TransactionController::class, 'release']);
Route::get('/transactions/{id}/print', [TransactionController::class, 'print']);

// Equipment API routes
Route::apiResource('/equipment', EquipmentController::class);

// Category API routes
use App\Http\Controllers\Api\CategoryController;
Route::apiResource('categories', CategoryController::class);
