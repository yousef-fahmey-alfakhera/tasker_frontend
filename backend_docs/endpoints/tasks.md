# Tasks API Documentation

Manage tasks, subtasks, priorities, automatic position ordering, status transitions, working/completion time tracking, and soft deletions. All routes require `Authorization: Bearer <token>`.

---

## 1. List Tasks

Supports filtering by query parameters: `workspace_id`, `project_id`, `status_id`, `priority`.

- **Method**: `GET`
- **URL**: `/api/tasks?workspace_id=1&priority=High`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Tasks retrieved successfully.",
  "data": [
    {
      "id": 1,
      "title": "Implement JWT & Sanctum API Tokens",
      "description": "Ensure API endpoints are authenticated",
      "priority": "High",
      "position": 1,
      "parent_task_id": null,
      "created_by": 1,
      "fixed_by": 2,
      "project_id": 1,
      "workspace_id": 1,
      "status_id": 2,
      "status": {
        "id": 2,
        "name": "In Progress",
        "stage": "working"
      },
      "start_date": "2026-09-17T09:00:00.000000Z",
      "due_date": "2026-09-20T18:00:00.000000Z",
      "working_at": "2026-09-17T09:30:00.000000Z",
      "completed_at": null,
      "actual_minutes": null,
      "subtasks_count": 2
    }
  ]
}
```

---

## 2. Create Task

Creates a task. If `position` is omitted, it automatically receives `max(position) + 1` within its workspace.

- **Method**: `POST`
- **URL**: `/api/tasks`

### Request Body
```json
{
  "project_id": 1,
  "workspace_id": 1,
  "status_id": 1,
  "title": "Build Task List Component",
  "description": "Design ClickUp-like task board",
  "priority": "Normal",
  "start_date": "2026-09-18 10:00:00",
  "due_date": "2026-09-25 18:00:00"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "id": 2,
    "title": "Build Task List Component",
    "priority": "Normal",
    "position": 2,
    "project_id": 1,
    "workspace_id": 1,
    "status_id": 1,
    "created_by": 1,
    "working_at": null,
    "completed_at": null,
    "actual_minutes": null
  }
}
```

---

## 3. Update Task & Automatic Lifecycle Calculations

- **Method**: `PUT` / `POST`
- **URL**: `/api/tasks/{id}`

### Behavior on Status Transitions:
1. **Transition to stage `working`**: Automatically populates `working_at` with current timestamp if not previously set.
2. **Transition to stage `completed`**: Automatically sets `completed_at = now()` and calculates `actual_minutes = completed_at - working_at` in minutes.

### Request Body
```json
{
  "status_id": 3,
  "fixed_by": 1
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": {
    "id": 1,
    "title": "Implement JWT & Sanctum API Tokens",
    "status_id": 3,
    "status": {
      "id": 3,
      "name": "Done",
      "stage": "completed"
    },
    "working_at": "2026-09-17T09:30:00.000000Z",
    "completed_at": "2026-09-17T11:15:00.000000Z",
    "actual_minutes": 105
  }
}
```

---

## 4. Delete Task (Soft Delete)

Soft deletes the task. The record remains stored with a `deleted_at` timestamp and can be restored or inspected in trash.

- **Method**: `DELETE`
- **URL**: `/api/tasks/{id}`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Task deleted successfully.",
  "data": null
}
```
