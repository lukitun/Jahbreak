const express = require('express');
const router = express.Router();

const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  moderateComment,
  toggleCommentLike,
  getPendingComments
} = require('../controllers/commentController');

const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const {
  validateCommentCreation,
  validatePagination,
  validateIdParam
} = require('../middleware/validation');
const { commentLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/post/:postId', validateIdParam, validatePagination, optionalAuth, getComments);

// Protected routes for moderation
router.get('/pending', authenticateToken, requireRole(['author', 'admin']), validatePagination, getPendingComments);
router.post('/:id/moderate', authenticateToken, requireRole(['author', 'admin']), validateIdParam, moderateComment);

// User routes (authenticated or guest)
router.post('/post/:postId', validateIdParam, commentLimiter, validateCommentCreation, optionalAuth, createComment);

// Authenticated user routes
router.use(authenticateToken);

router.put('/:id', validateIdParam, updateComment);
router.delete('/:id', validateIdParam, deleteComment);
router.post('/:id/like', validateIdParam, toggleCommentLike);

module.exports = router;