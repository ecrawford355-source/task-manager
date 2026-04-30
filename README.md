# Task Manager

A lightweight, team-friendly project management tool with Kanban boards, task tracking, and time logging.

## Features

- 📋 **Kanban Boards** - Organize tasks in customizable columns
- ✅ **Task Management** - Create, edit, delete, and prioritize tasks
- 👥 **Team Collaboration** - Assign tasks to team members
- ⏰ **Time Tracking** - Log minimal time spent on tasks
- 📝 **Comments & Notes** - Add context to tasks
- 📅 **Due Dates & Priorities** - Stay on schedule

## Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (email/password)

## Project Structure

```
task-manager/
├── frontend/          # React application
├── backend/           # Node.js/Express API
├── docs/              # Documentation
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB 4.4+ (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ecrawford355-source/task-manager.git
   cd task-manager
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Set up Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

Backend runs on `http://localhost:5000`
Frontend runs on `http://localhost:3000`

## API Documentation

See [API.md](./docs/API.md) for endpoint details.

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system design details.

## Development

- Backend: `npm run dev` (with nodemon)
- Frontend: `npm start` (with React dev server)

## Contributing

Contributions welcome! Please create a feature branch and submit a pull request.

## License

MIT
