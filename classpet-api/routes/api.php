<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClassroomController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\PointController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\PetTypeController;
use App\Http\Controllers\PetInteractionController;
use App\Http\Controllers\Api\UploadController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Teacher Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('classrooms', ClassroomController::class);

    // Student Mgmt
    Route::get('students/all', [StudentController::class, 'all']);
    Route::post('students', [StudentController::class, 'createStudent']);
    Route::apiResource('students', StudentController::class)->except(['index', 'store']);
    Route::post('classrooms/{classroom}/students', [StudentController::class, 'store']);
    Route::get('classrooms/{classroom}/students', [StudentController::class, 'index']);
    Route::post('students/{student}/assign-pet', [StudentController::class, 'assignPet']);

    // Pet Types
    Route::apiResource('pet-types', PetTypeController::class);
    Route::get('pet-types-default', [PetInteractionController::class, 'getDefaultPets']);
    Route::get('pet-types-shop', [PetInteractionController::class, 'getShopPets']);

    // Upload Images
    Route::post('upload/pet-image', [UploadController::class, 'uploadPetImage']);
    Route::delete('upload/pet-image', [UploadController::class, 'deletePetImage']);
    Route::post('upload/food-image', [UploadController::class, 'uploadFoodImage']);

    // Pet Interaction
    Route::get('pet-foods', [PetInteractionController::class, 'getFoods']);
    Route::get('students/{student}/inventory', [PetInteractionController::class, 'getInventory']);
    Route::post('students/{student}/buy-food', [PetInteractionController::class, 'buyFood']);
    Route::post('students/{student}/feed-pet', [PetInteractionController::class, 'feedPet']);
    Route::get('students/{student}/pet-details', [PetInteractionController::class, 'getPetDetails']);
    Route::post('students/{student}/buy-pet', [PetInteractionController::class, 'buyPet']);

    // Game Logic
    Route::post('students/{student}/points', [PointController::class, 'award']);
    Route::post('students/{student}/feed', [PetController::class, 'feed']);
    Route::get('point-transactions', [PointController::class, 'index']);

    // Shop Items (Admin)
    Route::get('shop/items', [ShopController::class, 'index']);
    Route::post('shop/items', [ShopController::class, 'storeItem']);
    Route::put('shop/items/{shopItem}', [ShopController::class, 'updateItem']);
    Route::delete('shop/items/{shopItem}', [ShopController::class, 'destroyItem']);
    
    // Shop (Student)
    Route::get('shop/pet-types', [ShopController::class, 'petTypes']);
    Route::get('students/{student}/items', [ShopController::class, 'studentItems']);
    Route::post('students/{student}/purchase', [ShopController::class, 'purchase']);
    Route::post('students/{student}/equip', [ShopController::class, 'equip']);
    Route::post('students/{student}/unequip', [ShopController::class, 'unequip']);
    Route::post('students/{student}/change-pet', [ShopController::class, 'changePet']);
});

// Public Routes (TV) - Thêm route cho tương tác pet
Route::get('public/classrooms/{slug}', [PublicController::class, 'show']);
Route::get('public/students/{student}/pet', [PetInteractionController::class, 'getPetDetails']);
Route::get('public/students/{student}/inventory', [PetInteractionController::class, 'getPublicInventory']);
Route::post('public/students/{student}/feed-pet', [PetInteractionController::class, 'feedPet']);
