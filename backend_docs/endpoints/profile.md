# Profile Endpoints Documentation

This document describes the profile endpoints in Tasker API. Profile endpoints are protected and require a Bearer token issued during authentication.

---

## 1. Get Profile

Returns details of the currently authenticated user.

- **Method**: `GET`
- **URL**: `/api/profile`
- **Headers**:
  - `Accept`: `application/json`
  - `Authorization`: `Bearer <access_token>`
  - `Accept-Language`: `en` (or `ar`)

### Success Response (200 OK)
- **English**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@tasker.test",
    "roles": [],
    "email_verified_at": null,
    "created_at": "2026-09-17T11:45:00.000000Z",
    "updated_at": "2026-09-17T11:45:00.000000Z"
  }
}
```

- **Arabic**:
```json
{
  "success": true,
  "message": "تم استرجاع بيانات الملف الشخصي بنجاح.",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@tasker.test",
    "roles": [],
    "email_verified_at": null,
    "created_at": "2026-09-17T11:45:00.000000Z",
    "updated_at": "2026-09-17T11:45:00.000000Z"
  }
}
```

---

## 2. Update Profile (PUT)

Updates profile attributes (e.g. name, email, password) using JSON payload.

- **Method**: `PUT`
- **URL**: `/api/profile`
- **Headers**:
  - `Accept`: `application/json`
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <access_token>`
  - `Accept-Language`: `en` (or `ar`)

### Request Body (JSON)
```json
{
  "name": "Jane Updated",
  "email": "jane.updated@tasker.test"
}
```

### Success Response (200 OK)
- **English**:
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "id": 1,
    "name": "Jane Updated",
    "email": "jane.updated@tasker.test",
    "roles": [],
    "email_verified_at": null,
    "created_at": "2026-09-17T11:45:00.000000Z",
    "updated_at": "2026-09-17T11:55:00.000000Z"
  }
}
```

- **Arabic**:
```json
{
  "success": true,
  "message": "تم تحديث الملف الشخصي بنجاح.",
  "data": {
    "id": 1,
    "name": "Jane Updated",
    "email": "jane.updated@tasker.test",
    "roles": [],
    "email_verified_at": null,
    "created_at": "2026-09-17T11:45:00.000000Z",
    "updated_at": "2026-09-17T11:55:00.000000Z"
  }
}
```

---

## 3. Update Profile (POST - Multipart / Form-Data)

Supports updating profile via `POST` (ideal for HTML forms or multipart uploads with avatars).

- **Method**: `POST`
- **URL**: `/api/profile`
- **Headers**:
  - `Accept`: `application/json`
  - `Authorization`: `Bearer <access_token>`
  - `Accept-Language`: `en` (or `ar`)

### Request Body (Form Data)
| Field | Type | Description |
|---|---|---|
| `name` | text | New display name |
| `email` | text | New email address |

### Success Response (200 OK)
Returns the same updated JSON resource as the PUT endpoint.
