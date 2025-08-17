const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllPosts,
  getAllComments,
  clearCache,
  getSystemHealth
} = require('../controllers/adminController');

const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  validatePagination,
  validateIdParam
} = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(authenticateToken, requireRole(['admin']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', validatePagination, getUsers);
router.put('/users/:id', validateIdParam, updateUser);
router.delete('/users/:id', validateIdParam, deleteUser);

// Content management
router.get('/posts', validatePagination, getAllPosts);
router.get('/comments', validatePagination, getAllComments);

// System management
router.post('/cache/clear', clearCache);
router.get('/health', getSystemHealth);

module.exports = router;