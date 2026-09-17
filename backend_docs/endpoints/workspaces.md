# Workspaces API Documentation

Manage Workspaces within Projects, along with member assignment and roles (`viewer`, `admin`, `it`, `creator`, `editor`). All routes require `Authorization: Bearer <token>`.

---

## 1. List Workspaces

- **Method**: `GET`
- **URL**: `/api/workspaces`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Workspaces retrieved successfully.",
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "name": "Backend Engineering",
      "description": "API Architecture & Infrastructure",
      "created_by": 1,
      "users": [
        {
          "id": 1,
          "name": "Alex Morgan",
          "email": "alex@tasker.test",
          "role": "creator"
        },
        {
          "id": 2,
          "name": "Sam Developer",
          "email": "sam@tasker.test",
          "role": "editor"
        }
      ],
      "tasks_count": 5
    }
  ]
}
```

---

## 2. Create Workspace

Creates a new workspace and optionally assigns users with roles.

- **Method**: `POST`
- **URL**: `/api/workspaces`

### Request Body
```json
{
  "project_id": 1,
  "name": "Frontend Team Workspace",
  "description": "Vue/React dashboard development",
  "users": [
    {
      "user_id": 2,
      "role": "admin"
    },
    {
      "user_id": 3,
      "role": "editor"
    },
    {
      "user_id": 4,
      "role": "viewer"
    }
  ]
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Workspace created successfully.",
  "data": {
    "id": 2,
    "project_id": 1,
    "name": "Frontend Team Workspace",
    "description": "Vue/React dashboard development",
    "created_by": 1,
    "users": [
      {
        "id": 1,
        "name": "Alex Morgan",
        "email": "alex@tasker.test",
        "role": "creator"
      },
      {
        "id": 2,
        "name": "John Doe",
        "email": "john@tasker.test",
        "role": "admin"
      }
    ]
  }
}
```

---

## 3. Show Workspace

- **Method**: `GET`
- **URL**: `/api/workspaces/{id}`

---

## 4. Update Workspace

- **Method**: `PUT` / `POST`
- **URL**: `/api/workspaces/{id}`

### Request Body
```json
{
  "name": "Frontend & Design Workspace",
  "users": [
    {
      "user_id": 2,
      "role": "it"
    }
  ]
}
```

---

## 5. Delete Workspace

- **Method**: `DELETE`
- **URL**: `/api/workspaces/{id}`
