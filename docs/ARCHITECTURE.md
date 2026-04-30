# Task Manager Architecture

## Overview

Task Manager is a full-stack web application built with:
- **Frontend**: React 18 with Tailwind CSS
- **Backend**: Node.js/Express.js
- **Database**: MongoDB
- **Auth**: JWT (JSON Web Tokens)

## Project Structure

```
task-manager/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── utils/           # Helper functions
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Custom middleware
│   │   └── index.js         # Server entry point
│   ├── .env.example
│   └── package.json
│
└── docs/                     # Documentation
    ├── API.md               # API endpoints
    └── ARCHITECTURE.md      # This file
```

## Data Models

### User
- `_id`: MongoDB ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `createdAt`: Date

### Board
- `_id`: MongoDB ObjectId
- `name`: String
- `description`: String
- `owner`: Reference to User
- `members`: Array of User references
- `columns`: Array of column objects
- `createdAt`: Date
- `updatedAt`: Date

### Task
- `_id`: MongoDB ObjectId
- `title`: String
- `description`: String
- `board`: Reference to Board
- `column`: String (column name)
- `assignees`: Array of User references
- `priority`: String (low/medium/high)
- `dueDate`: Date
- `timeLogged`: Number (minutes)
- `comments`: Array of comment objects
- `order`: Number (for sorting)
- `createdAt`: Date
- `updatedAt`: Date

## Authentication Flow

1. User registers/logs in with email and password
2. Server validates credentials and generates JWT token
3. Client stores token in localStorage
4. Client includes token in `Authorization: Bearer {token}` header
5. Server validates token with middleware
6. Requests are authenticated

## API Endpoints Summary

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Boards
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get single board
- `PUT /api/boards/:id` - Update board
- `POST /api/boards/:id/members` - Add member

### Tasks
- `GET /api/tasks/board/:boardId` - Get board tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment
- `POST /api/tasks/:id/time` - Log time

### Users
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user

## Development Workflow

1. Start MongoDB locally or use MongoDB Atlas
2. Run `npm install` in both `frontend` and `backend` directories
3. Create `.env` file in backend with required variables
4. Run `npm run dev` in backend (on port 5000)
5. Run `npm start` in frontend (on port 3000)
6. Navigate to `http://localhost:3000`

## Future Enhancements

- [ ] Drag-and-drop tasks between columns
- [ ] Real-time updates with WebSockets
- [ ] File attachments
- [ ] Activity log/history
- [ ] Email notifications
- [ ] Advanced filtering and search
- [ ] Team notifications
- [ ] Mobile app (React Native)
