<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminDataController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\PanelController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\SppgController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/home', [HomeController::class, 'index']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Panel routes
Route::get('/panel', [PanelController::class, 'index']);
Route::put('/panel/profile', [PanelController::class, 'updateProfile']);

// School report routes
Route::get('/panel/reports', [PanelController::class, 'listSchoolReports']);
Route::post('/panel/report', [PanelController::class, 'storeSchoolReport']);
Route::get('/panel/report/{id}', [PanelController::class, 'showSchoolReport']);

// SPPG distribution routes
Route::get('/panel/distributions', [PanelController::class, 'listDistributions']);
Route::post('/panel/distribution', [PanelController::class, 'storeDistribution']);
Route::get('/panel/distribution/{id}', [PanelController::class, 'showDistribution']);

// SPPG menu routes
Route::get('/panel/menus', [PanelController::class, 'listMenus']);
Route::post('/panel/menu', [PanelController::class, 'storeMenu']);
Route::delete('/panel/menu/{menuId}', [PanelController::class, 'deleteMenu']);

Route::get('/admin/stats', [AdminDataController::class, 'stats']);
Route::get('/admin/schema', [AdminDataController::class, 'schema']);
Route::get('/admin/rows/{table}', [AdminDataController::class, 'rows']);
Route::post('/admin/rows/{table}', [AdminDataController::class, 'store']);
Route::put('/admin/rows/{table}/{id}', [AdminDataController::class, 'update']);
Route::delete('/admin/rows/{table}/{id}', [AdminDataController::class, 'destroy']);

// User management routes with role-based integration
Route::get('/admin/users', [UserController::class, 'index']);
Route::post('/admin/users', [UserController::class, 'store']);
Route::get('/admin/users/{id}', [UserController::class, 'show']);
Route::put('/admin/users/{id}', [UserController::class, 'update']);

Route::get('/schools', [SchoolController::class, 'index']);
Route::get('/schools/{id}', [SchoolController::class, 'show']);

Route::get('/groups', [GroupController::class, 'index']);
Route::get('/groups/{id}', [GroupController::class, 'show']);

Route::get('/sppg', [SppgController::class, 'index']);
Route::get('/sppg/{id}', [SppgController::class, 'show']);

Route::post('/complaints', [ComplaintController::class, 'store']);
