const express = require('express');
const { authenticateToken, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getUserStats,
  getOnlineUsers,
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.get('/', getUsers);
router.get('/online', getOnlineUsers);
router.get('/:id', getUser);
router.get('/:id/stats', getUserStats);

// Admin-only routes
router.put('/:id/role', authorize(['admin']), updateUserRole);
router.patch('/:id/deactivate', authorize(['admin']), deactivateUser);
router.patch('/:id/reactivate', authorize(['admin']), reactivateUser);

module.exports = router;