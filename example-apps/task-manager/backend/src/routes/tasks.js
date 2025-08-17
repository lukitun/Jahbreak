const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validate, taskSchema, taskUpdateSchema } = require('../middleware/validation');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} = require('../controllers/taskController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Task routes
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', validate(taskSchema), createTask);
router.put('/:id', validate(taskUpdateSchema), updateTask);
router.delete('/:id', deleteTask);
router.patch('/reorder', reorderTasks);

module.exports = router;