# Attachments API Documentation

Manage polymorphic file uploads and attachments for tasks and other models. Supports direct file streaming/opening via `file_path`, file replacement via `FileService`, and automatic storage under `Task::ATTACHMENT_PATH` (`tasks/attachments`) for tasks.

All endpoints require `Authorization: Bearer <token>`.

---

## 1. List Attachments

Retrieve a list of attachments. Supports filtering by `attachable_type` and `attachable_id`.

- **Method**: `GET`
- **URL**: `/api/attachments?attachable_type=task&attachable_id=1`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`
  - `Accept-Language`: `en|ar`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Attachments retrieved successfully.",
  "data": [
    {
      "id": 1,
      "attachable_type": "App\\Models\\Task",
      "attachable_id": 1,
      "file": "architecture_diagram.png",
      "path": "tasks/attachments/wK981ls9a01x.png",
      "file_path": "http://localhost:8000/storage/tasks/attachments/wK981ls9a01x.png",
      "type": "image/png",
      "size": 245760,
      "created_by": 1,
      "creator": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@tasker.test"
      },
      "created_at": "2026-09-19T10:30:00.000000Z",
      "updated_at": "2026-09-19T10:30:00.000000Z"
    }
  ]
}
```

---

## 2. Upload / Store Attachment

Uploads a new file and creates an attachment record. If `attachable_type` is `task` (or `App\Models\Task`), the file is automatically stored in `tasks/attachments` (`Task::ATTACHMENT_PATH`).

- **Method**: `POST`
- **URL**: `/api/attachments`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `multipart/form-data`
  - `Accept`: `application/json`

### Form Data Parameters
| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `file` | Yes | The file binary (up to 50MB) |
| `attachable_type` | `string` | Yes | Target model alias or class (`task` or `App\Models\Task`) |
| `attachable_id` | `integer` | Yes | ID of the target model instance |

### Response (201 Created)
```json
{
  "success": true,
  "message": "Attachment uploaded successfully.",
  "data": {
    "id": 2,
    "attachable_type": "App\\Models\\Task",
    "attachable_id": 1,
    "file": "sprint_specs.pdf",
    "path": "tasks/attachments/3aFk091XpLz.pdf",
    "file_path": "http://localhost:8000/storage/tasks/attachments/3aFk091XpLz.pdf",
    "type": "application/pdf",
    "size": 524288,
    "created_by": 1,
    "created_at": "2026-09-19T10:35:00.000000Z",
    "updated_at": "2026-09-19T10:35:00.000000Z"
  }
}
```

---

## 3. Show Attachment

Retrieve details and direct openable URL for a single attachment.

- **Method**: `GET`
- **URL**: `/api/attachments/{id}`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Attachment retrieved successfully.",
  "data": {
    "id": 2,
    "attachable_type": "App\\Models\\Task",
    "attachable_id": 1,
    "file": "sprint_specs.pdf",
    "path": "tasks/attachments/3aFk091XpLz.pdf",
    "file_path": "http://localhost:8000/storage/tasks/attachments/3aFk091XpLz.pdf",
    "type": "application/pdf",
    "size": 524288,
    "created_by": 1,
    "creator": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@tasker.test"
    },
    "created_at": "2026-09-19T10:35:00.000000Z",
    "updated_at": "2026-09-19T10:35:00.000000Z"
  }
}
```

---

## 4. Update Attachment / Replace File

Update attachment metadata or replace the attached file. When a new file is uploaded, `FileService::replace` automatically removes the previous physical file from storage and stores the new one.

- **Method**: `PUT` or `POST` (use `POST` with `multipart/form-data` for file replacement)
- **URL**: `/api/attachments/{id}`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`

### Request Body (multipart/form-data)
| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `file` | Optional | New replacement file |
| `attachable_type` | `string` | Optional | Updated entity type |
| `attachable_id` | `integer` | Optional | Updated entity ID |

### Response (200 OK)
```json
{
  "success": true,
  "message": "Attachment updated successfully.",
  "data": {
    "id": 2,
    "attachable_type": "App\\Models\\Task",
    "attachable_id": 1,
    "file": "sprint_specs_v2.pdf",
    "path": "tasks/attachments/8Lm39kK1Qz.pdf",
    "file_path": "http://localhost:8000/storage/tasks/attachments/8Lm39kK1Qz.pdf",
    "type": "application/pdf",
    "size": 612400,
    "created_by": 1,
    "created_at": "2026-09-19T10:35:00.000000Z",
    "updated_at": "2026-09-19T10:45:00.000000Z"
  }
}
```

---

## 5. Delete Attachment

Soft-deletes the attachment record and cleans up the physical file on disk via `FileService::remove`.

- **Method**: `DELETE`
- **URL**: `/api/attachments/{id}`
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Attachment deleted successfully.",
  "data": null
}
```
