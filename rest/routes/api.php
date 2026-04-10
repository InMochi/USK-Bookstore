<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix('auth')->group(function() {

    Route::get('/user',[AuthController::class,'index']);
    Route::post('/register',[AuthController::class,'register']);
    Route::post('/login',[AuthController::class,'login']);
    
    
    Route::middleware('auth:sanctum')->group(function() {
        Route::post('/logout',[AuthController::class,'logout']);
    });
});


// Author Route
Route::get('/author',[AuthorController::class,'index']);
Route::get('/author/all',[AuthorController::class,'all']);
Route::get('/author/{id}',[AuthorController::class,'show']);
Route::get('/author/details/{id}',[AuthorController::class,'details']);

// Book Route
Route::get('/book',[BookController::class,'index']);
Route::get('/book/all',[BookController::class,'all']);
Route::get('/book/{id}',[BookController::class,'show']);


// Category Route
Route::get('/category',[CategoryController::class,'index']);
Route::get('/category/{id}',[CategoryController::class,'show']);
Route::get('/category/details/{id}',[CategoryController::class,'detail']);


// Protected Public Route  
Route::middleware('auth:sanctum')->group(function() {

    // Cart Protected Route
    Route::get('/cart',[CartController::class,'index']);
    Route::get('/cart/{id}',[CartController::class,'show']);
    Route::post('/books/{book}/cart',[CartController::class,'store']);
    Route::delete('/cart/{id}',[CartController::class,'destroy']);

    // Order Protected Route
    Route::get('/order',[OrderController::class,'index']);
    Route::get('/order/{id}',[OrderController::class,'show']);
    Route::post('/carts/{cart}/order',[OrderController::class,'store']);
    Route::delete('/order/{id}',[OrderController::class,'destroy']);
    Route::patch('/order/{id}', [OrderController::class, 'update']);
    Route::post('/orders/bulk', [OrderController::class, 'bulkStore']);

    // Payment Protected Route
    Route::get('/payment',[PaymentController::class,'index']);
    Route::get('/payment/{id}',[PaymentController::class,'show']);
    Route::post('/orders/{order}/payment',[PaymentController::class,'store']);
    Route::delete('/payment/{id}',[PaymentController::class,'destroy']);

});


Route::middleware('auth:sanctum')->group(function(){

    // Public Admin Route
    Route::middleware('role:admin')->group(function() {

        // Admin Order Management
        Route::patch('/payment/{id}', [PaymentController::class, 'update']); 
        
        // Author Protected Route
        Route::post('/author',[AuthorController::class,'store']);
        Route::post('/author/{id}',[AuthorController::class,'update']);
        Route::delete('/author/{id}',[AuthorController::class,'destroy']);

    
        // Book Protected Route
        Route::post('/authors/{id}/book',[BookController::class,'store']);
        Route::post('/book/{id}',[BookController::class,'update']);
        Route::delete('/book/{id}',[BookController::class,'destroy']);

    
        // Category Management
        Route::post('/books/{book}/category',[CategoryController::class,'store']);
        Route::delete('/category/{id}',[CategoryController::class,'destroy']);
        Route::patch('/category/{id}', [CategoryController::class, 'update']);
    
    });

});





