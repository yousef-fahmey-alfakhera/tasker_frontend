# Task Statuses API Documentation

Manage custom workflow statuses for tasks. Statuses belong to one of three lifecycle stages: `pending`, `working`, or `completed`. All routes require `Authorization: Bearer <token>`.

---

## 1. List Task Statuses

- **Method**: `GET`
- **URL**: `/api/task-statuses`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Task statuses retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "To Do",
      "stage": "pending",
      "color": "#94a3b8",
      "order": 1,
      "tasks_count": 8
    },
    {
      "id": 2,
      "name": "In Progress",
      "stage": "working",
      "color": "#3b82f6",
      "order": 2,
      "tasks_count": 4
    },
    {
      "id": 3,
      "name": "Completed",
      "stage": "completed",
      "color": "#22c55e",
      "order": 3,
      "tasks_count": 15
    }
  ]
}
```

---

## 2. Create Task Status

- **Method**: `POST`
- **URL**: `/api/task-statuses`

### Request Body
```json
{
  "name": "Code Review",
  "stage": "working",
  "color": "#f59e0b",
  "order": 3
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Task status created successfully.",
  "data": {
    "id": 4,
    "name": "Code Review",
    "stage": "working",
    "color": "#f59e0b",
    "order": 3
  }
}
```

---

## 3. Show Task Status

- **Method**: `GET`
- **URL**: `/api/task-statuses/{id}`

---

## 4. Update Task Status

- **Method**: `PUT` / `POST`
- **URL**: `/api/task-statuses/{id}`

---

## 5. Delete Task Status

- **Method**: `DELETE`
- **URL**: `/api/task-statuses/{id}`
