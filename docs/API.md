# Task Manager API Documentation

## Authentication

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Boards

### Get All Boards
```
GET /api/boards
Authorization: Bearer {token}

Response: [Board]
```

### Create Board
```
POST /api/boards
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}

Response: Board
```

### Get Single Board
```
GET /api/boards/:id
Authorization: Bearer {token}

Response: Board
```

### Update Board
```
PUT /api/boards/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}

Response: Board
```

### Add Member to Board
```
POST /api/boards/:id/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_id"
}

Response: Board
```

## Tasks

### Get Tasks by Board
```
GET /api/tasks/board/:boardId
Authorization: Bearer {token}

Response: [Task]
```

### Create Task
```
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task description",
  "board": "board_id",
  "column": "To Do",
  "priority": "high",
  "dueDate": "2026-05-15"
}

Response: Task
```

### Update Task
```
PUT /api/tasks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "column": "In Progress",
  "priority": "medium"
}

Response: Task
```

### Delete Task
```
DELETE /api/tasks/:id
Authorization: Bearer {token}

Response: { "message": "Task deleted" }
```

### Add Comment to Task
```
POST /api/tasks/:id/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "This is a comment"
}

Response: Task
```

### Log Time on Task
```
POST /api/tasks/:id/time
Authorization: Bearer {token}
Content-Type: application/json

{
  "minutes": 30
}

Response: Task
```

## Users

### Get All Users
```
GET /api/users
Authorization: Bearer {token}

Response: [User]
```

### Get Current User
```
GET /api/users/me
Authorization: Bearer {token}

Response: User
```
