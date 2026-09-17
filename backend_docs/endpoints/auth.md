# Authentication Endpoints Documentation

This document describes the endpoints for user registration, authentication (login), and session termination (logout) in Tasker API.

---

## 1. Register User

Creates a new user account and returns an authenticated personal access token.

- **Method**: `POST`
- **URL**: `/api/public/auth/register`
- **Headers**:
  - `Accept`: `application/json`
  - `Content-Type`: `application/json`
  - `Accept-Language`: `en` (or `ar` for Arabic responses)

### Request Body (JSON)
```json
{
  "name": "Jane Doe",
  "email": "jane@tasker.test",
  "password": "Password123!",
  "password_confirmation": "Password123!"
}
```

### Success Response (201 Created)
- **English (`Accept-Language: en`)**:
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@tasker.test",
    "roles": [],
    "created_at": "2026-09-17T11:45:00.000000Z",
    "updated_at": "2026-09-17T11:45:00.000000Z",
    "token": {
      "type": "Bearer",
      "access_token": "1|qWkZ3h8x0m5..."
    }
  }
}
```

- **Arabic (`Accept-Language: ar`)**:
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح.",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@tasker.test",
    "roles": [],
    "created_at": "2026-09-17T11:45:00.000000Z",
    "updated_at": "2026-09-17T11:45:00.000000Z",
    "token": {
      "type": "Bearer",
      "access_token": "1|qWkZ3h8x0m5..."
    }
  }
}
```

### Validation Error (422 Unprocessable Content)
```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": [
      "The email has already been taken."
    ]
  }
}
```

---

## 2. Login User

Authenticates credentials and returns a Bearer token.

- **Method**: `POST`
- **URL**: `/api/public/auth/login`
- **Headers**:
  - `Accept`: `application/json`
  - `Content-Type`: `application/json`
  - `Accept-Language`: `en` (or `ar`)

### Request Body (JSON)
```json
{
  "email": "jane@tasker.test",
  "password": "Password123!"
}
```

### Success Response (200 OK)
- **English**:
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@tasker.test",
    "roles": [],
    "created_at": "2026-09-17T11:45:00.000000Z",
    "updated_at": "2026-09-17T11:45:00.000000Z",
    "token": {
      "type": "Bearer",
      "access_token": "2|Xp9a8Kz20..."
    }
  }
}
```

- **Arabic**:
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح.",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@tasker.test",
    "roles": [],
    "created_at": "2026-09-17T11:45:00.000000Z",
    "updated_at": "2026-09-17T11:45:00.000000Z",
    "token": {
      "type": "Bearer",
      "access_token": "2|Xp9a8Kz20..."
    }
  }
}
```

### Invalid Credentials Response (422 Unprocessable Content)
- **English**:
```json
{
  "message": "The provided credentials do not match our records.",
  "errors": {
    "email": [
      "The provided credentials do not match our records."
    ]
  }
}
```

- **Arabic**:
```json
{
  "message": "بيانات الاعتماد المقدمة غير صحيحة.",
  "errors": {
    "email": [
      "بيانات الاعتماد المقدمة غير صحيحة."
    ]
  }
}
```

---

## 3. Logout User

Revokes the authenticated user's current token.

- **Method**: `POST`
- **URL**: `/api/auth/logout`
- **Headers**:
  - `Accept`: `application/json`
  - `Authorization`: `Bearer <access_token>`
  - `Accept-Language`: `en` (or `ar`)

### Success Response (200 OK)
- **English**:
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

- **Arabic**:
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح.",
  "data": null
}
```

### Unauthenticated Error (401 Unauthorized)
```json
{
  "message": "Unauthenticated."
}
```
