const express = require('express');
const authRoutes = require('./auth');
const taskRoutes = require('./tasks');
const taskListRoutes = require('./taskLists');
const userRoutes = require('./users');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/task-lists', taskListRoutes);
router.use('/users', userRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    name: 'Task Manager API',
    version: '1.0.0',
    description: 'RESTful API for collaborative task management',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/logout': 'Logout user',
      },
      tasks: {
        'GET /api/tasks': 'Get tasks with filters',
        'GET /api/tasks/:id': 'Get specific task',
        'POST /api/tasks': 'Create new task',
        'PUT /api/tasks/:id': 'Update task',
        'DELETE /api/tasks/:id': 'Delete task',
        'PATCH /api/tasks/reorder': 'Reorder tasks',
      },
      taskLists: {
        'GET /api/task-lists': 'Get user\'s task lists',
        'GET /api/task-lists/:id': 'Get specific task list',
        'POST /api/task-lists': 'Create new task list',
        'PUT /api/task-lists/:id': 'Update task list',
        'DELETE /api/task-lists/:id': 'Delete task list',
        'POST /api/task-lists/:id/members': 'Add member to task list',
        'DELETE /api/task-lists/:id/members/:memberId': 'Remove member from task list',
        'PATCH /api/task-lists/:id/members/:memberId/role': 'Update member role',
      },
      users: {
        'GET /api/users': 'Get users with search',
        'GET /api/users/online': 'Get online users',
        'GET /api/users/:id': 'Get specific user',
        'GET /api/users/:id/stats': 'Get user statistics',
        'PUT /api/users/:id/role': 'Update user role (admin only)',
        'PATCH /api/users/:id/deactivate': 'Deactivate user (admin only)',
        'PATCH /api/users/:id/reactivate': 'Reactivate user (admin only)',
      },
    },
    websocket: {
      events: {
        'task:created': 'New task created',
        'task:updated': 'Task updated',
        'task:deleted': 'Task deleted',
        'tasks:reordered': 'Tasks reordered',
        'taskList:updated': 'Task list updated',
        'taskList:deleted': 'Task list deleted',
        'member:added': 'Member added to task list',
        'member:removed': 'Member removed from task list',
        'member:roleUpdated': 'Member role updated',
        'user:online': 'User came online',
        'user:offline': 'User went offline',
      },
    },
  });
});

module.exports = router;