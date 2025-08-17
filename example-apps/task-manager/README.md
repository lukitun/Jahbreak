# Collaborative Task Management Application

A full-stack task management application with real-time collaboration features.

## Features

- **Authentication**: Email/password with JWT tokens
- **Real-time Collaboration**: WebSocket-based live updates
- **Task Management**: Complete CRUD operations with subtasks
- **User Roles**: Admin, Member, Viewer permissions
- **Modern UI**: React with TypeScript, Material-UI, dark/light mode

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components
- Socket.IO client for real-time updates
- Context API for state management
- Axios for API calls

### Backend
- Node.js with Express
- PostgreSQL database
- Socket.IO for WebSockets
- JWT authentication
- Sequelize ORM

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Installation

1. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

2. Configure database:
```bash
# Create PostgreSQL database
createdb task_manager

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

3. Run migrations:
```bash
cd backend
npm run migrate
```

4. Start development servers:
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm start
```

5. Open http://localhost:3000

## Project Structure

```
task-manager/
├── frontend/           # React TypeScript app
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── context/    # React context providers
│   │   ├── types/      # TypeScript definitions
│   │   └── utils/      # Helper functions
│   └── package.json
├── backend/            # Node.js Express API
│   ├── src/
│   │   ├── models/     # Database models
│   │   ├── controllers/# Route handlers
│   │   ├── routes/     # Express routes
│   │   ├── middleware/ # Custom middleware
│   │   └── utils/      # Helper functions
│   └── package.json
└── docs/              # Additional documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get team members
- `PUT /api/users/:id/role` - Update user role

## Real-time Events

### Socket.IO Events
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `user:online` - User came online
- `user:offline` - User went offline

## Deployment

### Environment Variables

#### Backend (.env)
```
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_manager
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## Development

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Database Migrations
```bash
cd backend
npm run migrate        # Run migrations
npm run migrate:undo   # Undo last migration
npm run seed           # Run seeders
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.