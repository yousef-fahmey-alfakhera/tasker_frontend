# Permissions API Documentation

Retrieve user permissions and system capabilities. Permissions are structured with `guard_name` (`sanctum`), standard action suffixes `(show,create,update,delete)_{resource}`, and Arabic labels (`name_ar`).

All routes require `Authorization: Bearer <token>`.

---

## 1. Get Authenticated User Permissions

Returns all direct and role-inherited permissions for the currently authenticated user.

- **Method**: `GET`
- **URL**: `/api/auth/permissions` (also available via `/api/permissions/me`)
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`
  - `Accept-Language`: `en|ar`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Permissions retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "show_tasks",
      "guard_name": "sanctum",
      "name_ar": "عرض المهام"
    },
    {
      "id": 2,
      "name": "create_tasks",
      "guard_name": "sanctum",
      "name_ar": "إنشاء المهام"
    },
    {
      "id": 3,
      "name": "update_tasks",
      "guard_name": "sanctum",
      "name_ar": "تعديل المهام"
    },
    {
      "id": 4,
      "name": "delete_tasks",
      "guard_name": "sanctum",
      "name_ar": "حذف المهام"
    }
  ]
}
```

---

## 2. List All Permissions (Admin)

Returns all permissions defined in the system. For regular users, this endpoint returns their own permissions.

- **Method**: `GET`
- **URL**: `/api/permissions`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Permissions retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "show_tasks",
      "guard_name": "sanctum",
      "name_ar": "عرض المهام"
    },
    {
      "id": 5,
      "name": "show_projects",
      "guard_name": "sanctum",
      "name_ar": "عرض المشاريع"
    }
  ]
}
```
