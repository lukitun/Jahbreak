const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategoryBySlug,
  getPostsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');

const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  validateCategoryCreation,
  validatePagination,
  validateSlugParam,
  validateIdParam
} = require('../middleware/validation');

// Public routes
router.get('/', getCategories);
router.get('/:slug', validateSlugParam, getCategoryBySlug);
router.get('/:slug/posts', validateSlugParam, validatePagination, getPostsByCategory);

// Admin only routes
router.use(authenticateToken, requireRole(['admin']));

router.post('/', validateCategoryCreation, createCategory);
router.put('/:id', validateIdParam, updateCategory);
router.delete('/:id', validateIdParam, deleteCategory);
router.get('/stats/all', getCategoryStats);

module.exports = router;