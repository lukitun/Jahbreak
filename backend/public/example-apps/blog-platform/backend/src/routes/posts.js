const express = require('express');
const router = express.Router();

const {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostsByAuthor,
  toggleLike,
  getPopularPosts
} = require('../controllers/postController');

const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const {
  validatePostCreation,
  validatePostUpdate,
  validatePagination,
  validateSlugParam,
  validateIdParam
} = require('../middleware/validation');
const { postLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', validatePagination, optionalAuth, getPosts);
router.get('/popular', validatePagination, getPopularPosts);
router.get('/author/:username', validatePagination, getPostsByAuthor);
router.get('/:slug', validateSlugParam, optionalAuth, getPostBySlug);

// Protected routes
router.use(authenticateToken);

// Author and admin routes
router.post('/', requireRole(['author', 'admin']), postLimiter, validatePostCreation, createPost);
router.put('/:id', requireRole(['author', 'admin']), validateIdParam, validatePostUpdate, updatePost);
router.delete('/:id', requireRole(['author', 'admin']), validateIdParam, deletePost);

// User routes
router.post('/:id/like', validateIdParam, toggleLike);

module.exports = router;