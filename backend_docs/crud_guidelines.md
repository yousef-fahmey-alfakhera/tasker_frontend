# Tasker CRUD Development Guidelines

This guide explains how to generate and structure new CRUD features in **Tasker** according to the project's standard architecture.

## Architecture Blueprint

```
app/
├── Http/
│   ├── Controllers/Api/V1/{Feature}/{Feature}Controller.php
│   ├── Requests/Api/V1/{Feature}/Store{Feature}Request.php
│   ├── Requests/Api/V1/{Feature}/Update{Feature}Request.php
│   └── Resources/Api/V1/{Feature}/{Feature}Resource.php
├── Services/
│   └── {Feature}/{Feature}Service.php
lang/
├── ar/messages.php
└── en/messages.php
routes/
└── api.php (contains Route::prefix('public') and Route::middleware('auth:sanctum'))
tests/
└── Feature/Api/V1/{Feature}/{Feature}Test.php
docs/
├── collection.json
└── endpoints/{feature}.md
```

## Route Group Format

All resource routes must follow the specified syntax:

```php
Route::group(
    [
        'prefix' => 'device-verify-requests',
        'controller' => DeviceVerifyRequestController::class,
    ],
    function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('/{deviceVerifyRequest}', 'show');
        Route::put('/{deviceVerifyRequest}', 'update');
        Route::post('/{deviceVerifyRequest}', 'update');
        Route::delete('/{deviceVerifyRequest}', 'destroy');
    }
);
```

## Response Standards
All controllers utilize `App\Traits\ApiResponse` which returns consistent JSON payloads:

### Success Response (HTTP 200/201)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

### Error Response (HTTP 4xx/5xx)
```json
{
  "success": false,
  "message": "The provided credentials do not match our records.",
  "errors": { ... }
}
```
