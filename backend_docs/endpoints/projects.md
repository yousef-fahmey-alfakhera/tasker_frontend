# Projects API Documentation

Manage high-level Projects in the Tasker backend. All routes are authenticated and require `Authorization: Bearer <token>`.

---

## 1. List Projects

Retrieves all projects with workspace and task counts.

- **Method**: `GET`
- **URL**: `/api/projects`
- **Headers**:
  - `Accept`: `application/json`
  - `Authorization`: `Bearer <token>`
  - `Accept-Language`: `en` (or `ar`)

### Response (200 OK)
```json
{
  "success": true,
  "message": "Projects retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Tasker SaaS",
      "description": "ClickUp alternative project management",
      "created_by": 1,
      "workspaces_count": 3,
      "tasks_count": 12,
      "created_at": "2026-09-17T12:00:00.000000Z",
      "updated_at": "2026-09-17T12:00:00.000000Z"
    }
  ]
}
```

---

## 2. Create Project

Creates a new project.

- **Method**: `POST`
- **URL**: `/api/projects`
- **Headers**:
  - `Accept`: `application/json`
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <token>`

### Request Body
```json
{
  "name": "Mobile Application",
  "description": "iOS and Android client development"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": 2,
    "name": "Mobile Application",
    "description": "iOS and Android client development",
    "created_by": 1,
    "created_at": "2026-09-17T12:05:00.000000Z",
    "updated_at": "2026-09-17T12:05:00.000000Z"
  }
}
```

---

## 3. Show Project

- **Method**: `GET`
- **URL**: `/api/projects/{id}`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Project retrieved successfully.",
  "data": {
    "id": 2,
    "name": "Mobile Application",
    "description": "iOS and Android client development",
    "created_by": 1,
    "workspaces_count": 0,
    "tasks_count": 0
  }
}
```

---

## 4. Update Project

Supports both `PUT` (JSON) and `POST` (multipart form-data).

- **Method**: `PUT` / `POST`
- **URL**: `/api/projects/{id}`

### Request Body
```json
{
  "name": "Mobile App 2.0"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Project updated successfully.",
  "data": {
    "id": 2,
    "name": "Mobile App 2.0",
    "description": "iOS and Android client development",
    "created_by": 1
  }
}
```

---

## 5. Delete Project

- **Method**: `DELETE`
- **URL**: `/api/projects/{id}`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Project deleted successfully.",
  "data": null
}
```
