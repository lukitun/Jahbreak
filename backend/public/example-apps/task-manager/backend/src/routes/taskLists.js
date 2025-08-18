const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, taskListSchema, taskListUpdateSchema } = require('../middleware/validation');
const {
  getTaskLists,
  getTaskList,
  createTaskList,
  updateTaskList,
  deleteTaskList,
  addMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/taskListController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Task list routes
router.get('/', getTaskLists);
router.get('/:id', getTaskList);
router.post('/', validate(taskListSchema), createTaskList);
router.put('/:id', validate(taskListUpdateSchema), updateTaskList);
router.delete('/:id', deleteTaskList);

// Member management routes
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);
router.patch('/:id/members/:memberId/role', updateMemberRole);

module.exports = router;