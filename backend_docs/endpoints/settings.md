# Settings API Documentation

Manage application settings and preferences (e.g. `theme_mode`, `light_mode`, `notifications_enabled`, `items_per_page`). All endpoints require `Authorization: Bearer <token>` and are guarded by permissions (`show_settings`, `create_settings`, `update_settings`, `delete_settings`).

---

## 1. List Settings

Retrieve all defined settings in the system.

- **Method**: `GET`
- **URL**: `/api/settings`
- **Required Permission**: `show_settings`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Settings retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "theme_mode",
      "type": "string",
      "default": "light",
      "description": "Active UI theme mode (light or dark)",
      "created_at": "2026-09-19T10:00:00.000000Z",
      "updated_at": "2026-09-19T10:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "light_mode",
      "type": "bool",
      "default": "true",
      "description": "Flag indicating if light mode is enabled",
      "created_at": "2026-09-19T10:00:00.000000Z",
      "updated_at": "2026-09-19T10:00:00.000000Z"
    }
  ]
}
```

---

## 2. Create Setting

Create a new application setting definition.

- **Method**: `POST`
- **URL**: `/api/settings`
- **Required Permission**: `create_settings`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`

### Request Body
```json
{
  "name": "max_file_size_mb",
  "type": "num",
  "default": "50",
  "description": "Maximum allowed file size in MB"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Setting created successfully.",
  "data": {
    "id": 6,
    "name": "max_file_size_mb",
    "type": "num",
    "default": "50",
    "description": "Maximum allowed file size in MB"
  }
}
```

---

## 3. Show Setting

Retrieve details of a single setting.

- **Method**: `GET`
- **URL**: `/api/settings/{id}`
- **Required Permission**: `show_settings`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Setting retrieved successfully.",
  "data": {
    "id": 1,
    "name": "theme_mode",
    "type": "string",
    "default": "light",
    "description": "Active UI theme mode (light or dark)"
  }
}
```

---

## 4. Update Setting

Update setting configuration or default value.

- **Method**: `PUT` / `POST`
- **URL**: `/api/settings/{id}`
- **Required Permission**: `update_settings`

### Request Body
```json
{
  "default": "dark"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Setting updated successfully.",
  "data": {
    "id": 1,
    "name": "theme_mode",
    "type": "string",
    "default": "dark"
  }
}
```

---

## 5. Delete Setting

Delete a setting definition.

- **Method**: `DELETE`
- **URL**: `/api/settings/{id}`
- **Required Permission**: `delete_settings`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Setting deleted successfully.",
  "data": null
}
```
