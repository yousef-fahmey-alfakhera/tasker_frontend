# User Settings & Theme / Light Mode API Documentation

Manage user-specific setting preferences and toggle between Light and Dark mode. All routes require `Authorization: Bearer <token>` and are guarded by permissions (`show_user_settings`, `create_user_settings`, `update_user_settings`, `delete_user_settings`).

---

## 1. Get Current Theme Mode (Light / Dark)

Retrieve the authenticated user's current theme preference. If not customized, returns the system default (`light`).

- **Method**: `GET`
- **URL**: `/api/user-settings/theme`
- **Required Permission**: `show_user_settings`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Theme retrieved successfully.",
  "data": {
    "theme_mode": "light",
    "is_light": true,
    "is_dark": false
  }
}
```

---

## 2. Set Theme Mode (Switch to Light or Dark)

Set or toggle the user's theme preference. Automatically updates both `theme_mode` and `light_mode` settings.

- **Method**: `POST`
- **URL**: `/api/user-settings/theme`
- **Required Permission**: `create_user_settings`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`

### Request Body
```json
{
  "theme": "light"
}
```
*(Values allowed: `"light"` or `"dark"`)*

### Response (200 OK)
```json
{
  "success": true,
  "message": "Theme updated successfully.",
  "data": {
    "theme_mode": "light",
    "is_light": true,
    "is_dark": false
  }
}
```

---

## 3. List User Settings

Retrieve all configured setting preferences for the authenticated user.

- **Method**: `GET`
- **URL**: `/api/user-settings`
- **Required Permission**: `show_user_settings`

### Response (200 OK)
```json
{
  "success": true,
  "message": "User settings retrieved successfully.",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "setting_id": 1,
      "setting_name": "theme_mode",
      "type": "string",
      "value": "light",
      "casted_value": "light"
    },
    {
      "id": 2,
      "user_id": 1,
      "setting_id": 4,
      "setting_name": "items_per_page",
      "type": "num",
      "value": "50",
      "casted_value": 50
    }
  ]
}
```

---

## 4. Store / Update User Setting

Save or upsert a setting value for the authenticated user.

- **Method**: `POST`
- **URL**: `/api/user-settings`
- **Required Permission**: `create_user_settings`

### Request Body
```json
{
  "setting_id": 4,
  "value": "50"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "User setting saved successfully.",
  "data": {
    "id": 2,
    "user_id": 1,
    "setting_id": 4,
    "value": "50",
    "casted_value": 50
  }
}
```

---

## 5. Reset User Setting (Delete)

Remove a user setting override and revert back to system default.

- **Method**: `DELETE`
- **URL**: `/api/user-settings/{id}`
- **Required Permission**: `delete_user_settings`

### Response (200 OK)
```json
{
  "success": true,
  "message": "User setting reset successfully.",
  "data": null
}
```
